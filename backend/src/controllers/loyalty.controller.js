import LoyaltyTransaction from "../models/loyaltyTransaction.model.js";
import Order from "../models/order.model.js";
import Setting from "../models/settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Loyalty tier thresholds by lifetime points balance.
const tierFor = (points) =>
  points >= 1000 ? "Platinum" : points >= 500 ? "Gold" : points >= 100 ? "Silver" : "Bronze";
const nextTierAt = (points) =>
  points >= 1000 ? null : points >= 500 ? 1000 : points >= 100 ? 500 : 100;

const getMyLoyalty = asyncHandler(async (req, res) => {
  const balance = Number(req.user.loyaltyPointsBalance || 0);

  const transactions = await LoyaltyTransaction.findAll({
    where: { userId: req.user.id },
    include: [{ model: Order, as: "order", attributes: ["orderNumber"] }],
    order: [["createdAt", "DESC"]],
    limit: 50
  });

  const cfgRows = await Setting.findAll({
    where: { key: ["loyalty_points_per_dollar", "loyalty_points_redemption_rate"] }
  });
  const cfg = Object.fromEntries(cfgRows.map((r) => [r.key, Number(r.value)]));

  const earned = transactions.filter((t) => t.points > 0).reduce((s, t) => s + t.points, 0);
  const spent = transactions.filter((t) => t.points < 0).reduce((s, t) => s + Math.abs(t.points), 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        balance,
        tier: tierFor(balance),
        nextTierAt: nextTierAt(balance),
        lifetimeEarned: earned,
        lifetimeSpent: spent,
        pointsPerDollar: cfg.loyalty_points_per_dollar ?? 1,
        redemptionRate: cfg.loyalty_points_redemption_rate ?? 0.01,
        transactions: transactions.map((t) => ({
          id: t.id,
          points: t.points,
          type: t.type,
          description: t.description,
          orderNumber: t.order?.orderNumber || null,
          createdAt: t.createdAt
        }))
      },
      "Loyalty summary fetched successfully"
    )
  );
});

export { getMyLoyalty };
