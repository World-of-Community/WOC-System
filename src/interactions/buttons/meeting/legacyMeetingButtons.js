import { handleMeetingButton, TEAM_CHANNEL_ID } from "#systems/teammanager.js";

// Buttons on the old serverdb.meetings embeds; only valid inside the team channel
function legacyButton(id) {
  return {
    id,
    async run(client, interaction) {
      if (interaction.channelId !== TEAM_CHANNEL_ID) {return;}
      await handleMeetingButton(interaction, id);
    },
  };
}

export default [legacyButton("remindMe"), legacyButton("attend"), legacyButton("decline")];
