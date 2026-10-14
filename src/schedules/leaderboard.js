import { updateLeaderboard, resetLeaderboardStats } from "#systems/leaderboard.js";

export default [
  {
    name: "leaderboardUpdate",
    cron: "* * * * *",
    runOnReady: true,
    execute: updateLeaderboard,
  },
  {
    name: "leaderboardMonthlyReset",
    cron: "0 0 1 * *",
    execute: resetLeaderboardStats,
  },
];
