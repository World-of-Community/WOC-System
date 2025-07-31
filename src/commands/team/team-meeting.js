const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Meeting = require("../../../Datenbank/meetingdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meeting")
    .setDescription("📅 Erstelle ein Team-Meeting")
    .addStringOption(opt => opt.setName("title").setDescription("Titel").setRequired(true))
    .addStringOption(opt => opt.setName("description").setDescription("Beschreibung").setRequired(true))
    .addStringOption(opt => opt.setName("date").setDescription("Datum und Uhrzeit").setRequired(true)),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const date = interaction.options.getString("date");

    const embed = new EmbedBuilder()
      .setTitle('`📅` » Eine Team-Besprechung wurde geplant.')
      .setDescription(`${description}\n\n🕒 **Wann?** ${date}`)
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("meeting_join").setLabel("✅ Teilnehmen").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("meeting_decline").setLabel("❌ Nicht teilnehmen").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("meeting_list").setLabel("📋 Teilnehmer").setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    await Meeting.create({
      guildID: interaction.guildId,
      messageID: msg.id,
      title,
      description,
      date,
      participants: [],
      declines: [],
    });
  },
};

/*

case "plan":
                        const dateStr = interaction.options.getString('datum');
                        const description = interaction.options.getString('beschreibung') || 'Keine Beschreibung angegeben';
                    
                        const datePattern = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
                        const match = dateStr.match(datePattern);
                    
                        if (!match) {
                            return interaction.reply({ content: '> `❌` » Bitte gib das Datum im Format `DD.MM.YYYY HH:MM` ein.', ephemeral: true });
                        }
                    
                        const [_, day, month, year, hour, minute] = match;
                    
                        // Erstelle das Meeting-Datum in UTC
                        const meetingDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

                        // Überprüfe die Gültigkeit des Datums
                        if (isNaN(meetingDateUTC.getTime())) {
                            return interaction.reply({ content: '> `❌` » Das Datum scheint ungültig zu sein. Bitte überprüfe deine Eingabe.', ephemeral: true });
                        }
                    
                        // Speichern des Meetings in der Datenbank
                        try {
                            const teamDataMeeting =await serverdb.findOneAndUpdate(
                                { guildID: "815919809379172354" },
                                {
                                    $push: {
                                        meetings: {
                                            date: meetingDateUTC,
                                            description: description,
                                            reminders: [],
                                            attendees: [],
                                            nonAttendees: [],
                                            messageID: null,
                                        }
                                    }
                                },
                                { new: true, upsert: true }
                            );
                    
                            await interaction.reply({ content: '> `✅` » Das Meeting wurde **erfolgreich** geplant.', ephemeral: true });

                            const localDate = new Date(meetingDateUTC.getTime() - meetingDateUTC.getTimezoneOffset() * 60000);
                            const dayName = days[localDate.getDay()];
                            const day = localDate.getDate().toString().padStart(2, '0');
                            const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
                            const year = localDate.getFullYear();
                            const hour = localDate.getHours().toString().padStart(2, '0');
                            const minute = localDate.getMinutes().toString().padStart(2, '0');

                            const TeamMeetingEmbed = new EmbedBuilder()
                            .setTitle('`📅` » Eine Team-Besprechung wurde geplant.')
                            .setDescription(`> **Datum:** ${dayName}, ${day}.${month}.${year} ${hour}:${minute}\n> **Beschreibung:** ${description}`)

                            const remindMeButton = new ButtonBuilder()
                                .setCustomId('remindMe')
                                .setLabel('🕒 Remind Me')
                                .setStyle(ButtonStyle.Primary);
                    
                            const attendButton = new ButtonBuilder()
                                .setCustomId('attend')
                                .setLabel('✅ Teilnehmen')
                                .setStyle(ButtonStyle.Success);
                    
                            const declineButton = new ButtonBuilder()
                                .setCustomId('decline')
                                .setLabel('❌ Nicht Teilnehmen')
                                .setStyle(ButtonStyle.Secondary);

                            const listButton = new ButtonBuilder()
                                .setCustomId('list')
                                .setLabel('📋 Teilnehmerliste')
                                .setStyle(ButtonStyle.Secondary);
                
                        const row = new ActionRowBuilder().addComponents(remindMeButton, attendButton, declineButton, listButton);
                
                        const meetingMessage = await targetChannel2.send({ embeds: [TeamMeetingEmbed], components: [row] });

                        const meetingIndex = teamDataMeeting.meetings.length - 1;
                        teamDataMeeting.meetings[meetingIndex].messageID = meetingMessage.id;
                
                        await teamDataMeeting.save();

                        const reminderDate = new Date(meetingDateUTC.getTime() - 10 * 60000);
                        const deleteDate = new Date(meetingDateUTC.getTime() + 60000); 
                
                        schedule.scheduleJob(reminderDate, () => {
                            remindUsers(client, meetingDateUTC);
                        });
    
                        schedule.scheduleJob(deleteDate, () => {
                            deleteMeetingMessage(client, meetingDateUTC);
                        });
    
                        } catch (error) {
                            console.error('Fehler beim Speichern des Meetings:', error);
                            await interaction.reply({ content: '> `❌` » Es ist ein Fehler beim Planen des Meetings aufgetreten.', ephemeral: true });
                        }  
                        break;
*/