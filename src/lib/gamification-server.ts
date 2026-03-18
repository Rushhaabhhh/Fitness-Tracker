import { User } from "./models";
import { Types } from "mongoose";
import { calculateLevel } from "./gamification";

export async function addXpToUser(userId: string | Types.ObjectId, amount: number) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.xp = (user.xp || 0) + amount;
    
    // Check for level up
    const newLevel = calculateLevel(user.xp);
    let leveledUp = false;
    
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
      leveledUp = true;
    }

    await user.save();
    return { user, leveledUp };
  } catch (error) {
    console.error("Error adding XP:", error);
    return null;
  }
}

export async function checkAndAwardBadge(userId: string | Types.ObjectId, badgeId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const hasBadge = user.badges?.some((b: { id: string }) => b.id === badgeId);
    if (!hasBadge) {
      if (!user.badges) user.badges = [];
      user.badges.push({ id: badgeId, unlockedAt: new Date() });
      await user.save();
      return true; // Newly unlocked
    }
    return false; // Already had it
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
}
