import { grantOneYearRole } from "#systems/erfolge.js";

export default {
  name: "oneYearMember",
  cron: "0 0 * * *",

  async execute(client) {
    await grantOneYearRole(client);
  },
};
