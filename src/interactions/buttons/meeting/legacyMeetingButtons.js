import { handleMeetingButton } from "#systems/teammanager.js";
import { settings } from "#core/settings.js";

// Buttons on the old serverdb.meetings embeds; only valid inside the team channel
function legacyButton(id) {
  return {
    id,
    async run(client, interaction) {
      if (interaction.channelId !== settings.get("channels.team")) {return;}
      await handleMeetingButton(interaction, id);
    },
  };
}

export default [legacyButton("remindMe"), legacyButton("attend"), legacyButton("decline")];
