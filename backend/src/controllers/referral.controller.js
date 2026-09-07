import User from "../models/users.model.js";
import Referral from "../models/referral.model.js";
import Setting from "../models/settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureReferralCode } from "../utils/referral.js";

const APP_URL = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");

const getMyReferrals = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const code = await ensureReferralCode(user);

  const referrals = await Referral.findAll({
    where: { referrerId: req.user.id },
    include: [{ model: User, as: "referee", attributes: ["firstName", "lastName", "email", "createdAt"] }],
    order: [["createdAt", "DESC"]],
  });

  const rewardRow = await Setting.findByPk("referral_reward_points");
  const rewardPoints = Number(rewardRow?.value) || 200;

  const completed = referrals.filter((r) => r.status === "COMPLETED");
  const pointsEarned = completed.reduce((s, r) => s + (r.rewardPoints || 0), 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        code,
        link: `${APP_URL}/register?ref=${code}`,
        rewardPoints,
        stats: {
          invited: referrals.length,
          joined: referrals.length,
          completed: completed.length,
          pointsEarned,
        },
        referrals: referrals.map((r) => ({
          id: r.id,
          name: r.referee ? `${r.referee.firstName} ${r.referee.lastName}`.trim() : "A friend",
          email: r.referee?.email
            ? r.referee.email.replace(/^(.{2}).*(@.*)$/, "$1•••$2")
            : null,
          status: r.status,
          rewardPoints: r.rewardPoints,
          joinedAt: r.createdAt,
          completedAt: r.completedAt,
        })),
      },
      "Referral summary fetched"
    )
  );
});

export { getMyReferrals };
