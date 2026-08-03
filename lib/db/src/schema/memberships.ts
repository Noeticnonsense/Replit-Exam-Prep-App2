import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  plan: text("plan").notNull().default("member"),
  active: boolean("active").notNull().default(false),
  whopCheckoutConfigId: text("whop_checkout_config_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export type Membership = typeof memberships.$inferSelect;
