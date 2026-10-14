import { rescheduleMeetingTasks } from "#systems/teammanager.js";
import { scheduleAllUpcoming } from "#systems/meetingReminder.js";
import { reportError } from "#core/errors.js";

export default {
  name: "meetingTasks",
  start(client) {
    rescheduleMeetingTasks(client).catch((error) => reportError(error, { source: "schedule:meetingTasks" }));
    scheduleAllUpcoming().catch((error) => reportError(error, { source: "schedule:meetingReminders" }));
  },
};
