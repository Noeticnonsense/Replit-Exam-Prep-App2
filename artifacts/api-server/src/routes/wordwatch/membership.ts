import { Router } from "express";
import { db, memberships } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.get("/membership", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const rows = await db
      .select()
      .from(memberships)
      .where(eq(memberships.clerkUserId, userId))
      .limit(1);

    const membership = rows[0];

    if (!membership || !membership.active) {
      res.json({ active: false, plan: null });
      return;
    }

    // Check expiry if set
    if (membership.expiresAt && membership.expiresAt < new Date()) {
      res.json({ active: false, plan: null });
      return;
    }

    res.json({ active: true, plan: membership.plan });
  } catch (err) {
    req.log.error({ err }, "Failed to check membership");
    res.status(500).json({ error: "Failed to check membership" });
  }
});

export default router;
