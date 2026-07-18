// Celebration helper — consistent positive reinforcement across trainers.
//
// Trainers previously varied in how (and whether) they acknowledged a hot
// streak. This centralises a milestone celebration so every trainer rewards
// momentum the same way: a strong haptic pulse and a toast at 5, 10, 25, 50…
import { showToast } from '../components/Toast';
import { tapHeavy } from './haptics';

export const STREAK_MILESTONES = [5, 10, 25, 50, 100];

/** True when `streak` is a celebration-worthy milestone. */
export const isStreakMilestone = (streak: number): boolean =>
    STREAK_MILESTONES.includes(streak);

/**
 * Fire a celebration if the streak just hit a milestone. Safe to call on every
 * correct answer; it no-ops otherwise. Side effects only (haptic + toast).
 */
export const celebrateStreak = (streak: number): void => {
    if (!isStreakMilestone(streak)) return;
    tapHeavy();
    showToast(`🔥 Sequência de ${streak}! Continue assim!`, 'success');
};

export default { isStreakMilestone, celebrateStreak, STREAK_MILESTONES };
