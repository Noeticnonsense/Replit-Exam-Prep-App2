import { Router } from "express";
import { db, memberships } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";
import { getWhopClient } from "../../whopClient";

const router = Router();

const PLAN_ID = process.env.WHOP_PLAN_ID!;

type CheckoutConfig = {
  id: string;
  purchase_url: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCheckoutConfig(value: unknown): value is CheckoutConfig {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.purchase_url === "string" &&
    value.purchase_url.length > 0
  );
}

function isPayment(value: unknown): value is { status?: unknown } {
  return isRecord(value);
}

function getRedirectUrl(req: any): string {
  // Build the redirect URL back to the WordWatch app
  const domains = process.env.REPLIT_DOMAINS ?? process.env.REPLIT_DEV_DOMAIN;
  const domain = domains?.split(",")[0]?.trim();
  if (domain) {
    return `https://${domain}/wordwatch/app?checkout=complete`;
  }
  // Fallback to request origin
  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3000}`;
  return `${origin}/wordwatch/app?checkout=complete`;
}

// POST /wordwatch/checkout — create a Whop checkout session
router.post("/checkout", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const whop = await getWhopClient();
    const redirectUrl = getRedirectUrl(req);

    // Create a checkout configuration for this user
    const checkoutConfigResponse: unknown =
      (await (
        whop as unknown as {
          checkout_configurations?: {
            create?: (params: {
              plan_id: string;
              redirect_url: string;
            }) => Promise<unknown>;
          };
        }
      ).checkout_configurations?.create?.({
        plan_id: PLAN_ID,
        redirect_url: redirectUrl,
      })) ?? (await createCheckoutViaRest(redirectUrl));

    if (!isCheckoutConfig(checkoutConfigResponse)) {
      throw new Error("Invalid checkout config response from Whop");
    }
    const checkoutConfig = checkoutConfigResponse;

    // Upsert membership row (pending, not yet active)
    await db
      .insert(memberships)
      .values({
        clerkUserId: userId,
        plan: "pro",
        active: false,
        whopCheckoutConfigId: checkoutConfig.id,
      })
      .onConflictDoUpdate({
        target: memberships.clerkUserId,
        set: {
          whopCheckoutConfigId: checkoutConfig.id,
          active: false,
        },
      });

    res.json({ checkoutUrl: checkoutConfig.purchase_url });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Failed to start checkout. Please try again." });
  }
});

// POST /wordwatch/checkout/verify — verify payment and activate membership
router.post("/checkout/verify", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    // Look up the user's pending checkout config
    const rows = await db
      .select()
      .from(memberships)
      .where(eq(memberships.clerkUserId, userId))
      .limit(1);

    const membership = rows[0];

    if (!membership?.whopCheckoutConfigId) {
      res.json({ active: false, plan: null });
      return;
    }

    // Already active — nothing to verify
    if (membership.active) {
      res.json({ active: true, plan: membership.plan });
      return;
    }

    // Check Whop for payments on this checkout config
    const companyId = process.env.WHOP_COMPANY_ID!;
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? `repl ${process.env.REPL_IDENTITY}`
      : process.env.WEB_REPL_RENEWAL
        ? `depl ${process.env.WEB_REPL_RENEWAL}`
        : null;

    const resp = await fetch(
      `https://${hostname}/api/v2/proxy/api/v1/payments?company_id=${companyId}&checkout_configuration_ids[]=${membership.whopCheckoutConfigId}&first=5`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Replit-Token": xReplitToken!,
          "Connector-Name": "whop",
        },
      },
    );

    const data: unknown = await resp.json();
    const payments =
      isRecord(data) && Array.isArray(data.data)
        ? data.data.filter(isPayment)
        : [];
    const paid = payments.some(
      (payment) =>
        payment.status === "paid" || payment.status === "complete",
    );

    if (paid) {
      // Activate the membership — set expiry 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db
        .update(memberships)
        .set({ active: true, plan: "pro", expiresAt })
        .where(eq(memberships.clerkUserId, userId));

      res.json({ active: true, plan: "pro" });
    } else {
      res.json({ active: false, plan: null });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to verify checkout");
    res.status(500).json({ error: "Failed to verify payment. Please try again." });
  }
});

// Fallback: create checkout config via raw Whop REST proxy
async function createCheckoutViaRest(redirectUrl: string) {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;

  const resp = await fetch(
    `https://${hostname}/api/v2/proxy/api/v1/checkout_configurations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Replit-Token": xReplitToken!,
        "Connector-Name": "whop",
      },
      body: JSON.stringify({
        plan_id: process.env.WHOP_PLAN_ID,
        redirect_url: redirectUrl,
      }),
    },
  );

  return resp.json();
}

export default router;
