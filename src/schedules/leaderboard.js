import {
  updateLeaderboard,
  announceLeaderboardWinners,
  resetLeaderboardStats,
} from "#systems/leaderboard.js";

export default [
  {
    name: "leaderboardUpdate",
    cron: "* * * * *",
    runOnReady: true,
    execute: updateLeaderboard,
  },
  {
    name: "leaderboardWinnerAnnouncement",
    cron: "0 20 28-31 * *",
    execute: announceLeaderboardWinners,
  },
  {
    name: "leaderboardMonthlyReset",
    cron: "0 0 1 * *",
    execute: resetLeaderboardStats,
  },
];
