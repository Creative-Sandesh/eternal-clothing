import crypto from "crypto";
import User from "../models/users.model.js";
import Referral from "../models/referral.model.js";
import LoyaltyTransaction from "../models/loyaltyTransaction.model.js";
import Setting from "../models/settings.model.js";
import { notify } from "./notify.js";

// Short, unambiguous referral code (no 0/O/1/I).
export const generateReferralCode = () =>
  Array.from({ length: 8 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");

export const ensureReferralCode = async (user) => {
  if (user.referralCode) return user.referralCode;
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    const clash = await User.findOne({ where: { referralCode: code } });
    if (!clash) {
      user.referralCode = code;
      await user.save({ validate: false });
      return code;
    }
  }
  return null;
};

const rewardPoints = async () => {
  const row = await Setting.findByPk("referral_reward_points");
  const n = Number(row?.value);
  return Number.isFinite(n) && n > 0 ? n : 200;
};

/**
 * Called when a referee completes their first PAID order. Completes the pending
 * referral and credits both users with loyalty points. Safe to call every order —
 * it no-ops if there's nothing pending. Pass a transaction.
 */
export const completeReferralIfPending = async (refereeId, transaction) => {
  const referral = await Referral.findOne({
    where: { refereeId, status: "PENDING" },
    transaction,
  });
  if (!referral) return;

  const points = await rewardPoints();
  const now = new Date();

  await referral.update({ status: "COMPLETED", rewardPoints: points, completedAt: now }, { transaction });

  for (const userId of [referral.referrerId, referral.refereeId]) {
    await LoyaltyTransaction.create(
      {
        userId,
        points,
        type: "EARNED",
        description:
          userId === referral.referrerId
            ? "Referral reward — a friend placed their first order"
            : "Welcome bonus — referred by a friend",
      },
      { transaction }
    );
    await User.increment({ loyaltyPointsBalance: points }, { where: { id: userId }, transaction });
  }

  // Write notifications inside the same transaction so they share the connection
  // and can't deadlock against the row locks this function just took.
  await notify(referral.referrerId, {
    type: "REFERRAL_COMPLETED",
    title: `+${points} referral points`,
    message: "A friend you referred just placed their first order.",
    link: "/account/referral",
  }, { transaction });
  await notify(referral.refereeId, {
    type: "LOYALTY_EARNED",
    title: `+${points} welcome points`,
    message: "Welcome bonus for joining through a referral.",
    link: "/account/loyalty",
  }, { transaction });
};
