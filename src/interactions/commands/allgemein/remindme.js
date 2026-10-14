import { EmbedBuilder, MessageFlags } from "discord.js";
import ms from "ms";
import schedule from "node-schedule";
import logger from "#core/logger.js";

const reminders = new Map();

export default {
  name: "remindme",
  description: "Remindme",
  type: 1,
  options: [
    {
      type: 1,
      name: "create",
      description: "» Erstellt eine Erinnerung. ⏰",
      options: [
        {
          type: 3,
          name: "zeit",
          description: "» Die Zeit (z.B. 10m, 1h)",
          required: true,
        },
        {
          type: 3,
          name: "erinnerung",
          description: "» Die Erinnerung",
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: "list",
      description: "» Listet alle deine Erinnerungen auf. 📋",
      options: [],
    },
    {
      type: 1,
      name: "remove",
      description: "» Entfernt eine deiner Erinnerungen. 🗑️",
      options: [
        {
          type: 4,
          name: "reminder",
          description: "Der Index der zu entfernenden Erinnerung (siehe /remindme-list)",
          required: true,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "create": {
        const duration = interaction.options.getString("zeit");

        const list = duration.split(" ");
        let durationDauer = 0;

        list.forEach(async element => {
          try {
            durationDauer += ms(element);
          } catch (error) {
            logger.info(error);
          }
        });
        if (durationDauer !== durationDauer) {
          return await interaction.reply({content: "> `❌` » Die Dauer konnte nicht verarbeitet werden!", flags: MessageFlags.Ephemeral});
        }

        const endDate = new Date(new Date().getTime() + durationDauer);

        const timestamp = Math.floor(endDate / 1000);

        const reminder = interaction.options.getString("erinnerung");

        const remindEmbed = new EmbedBuilder()
          .setTitle("Du hast eine Erinnerung erstellt")
          .setDescription(`\`⏰\` » Ich werde dich <t:${timestamp}:R> an ${reminder} erinnern.`)
          .setColor("Blurple")
          .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
          .setTimestamp();

        await interaction.reply({ embeds: [remindEmbed], flags: MessageFlags.Ephemeral });

        if (!reminders.has(userId)) {
          reminders.set(userId, []);
        }

        const reminderJob = schedule.scheduleJob(endDate, async () => {
          const user = interaction.user;

          const dmEmbed = new EmbedBuilder()
            .setTitle("Hey! Ich sollte dich an etwas erinnern!")
            .setDescription(`Hallo, ${user}\n\n> Erinnerung: **${reminder}**\n\n*📨 Du erhältst diese Direktnachricht, weil du eine Erinnerung erstellt hast.*`)
            .setColor("Blurple")
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

          try {
            await user.send({ embeds: [dmEmbed] });
          } catch (error) {
            logger.error(`DM konnte nicht an ${user.username} gesendet werden:`, error);
          }

          const userReminders = reminders.get(userId).filter(r => r.timestamp !== timestamp);
          reminders.set(userId, userReminders);
        });

        reminders.get(userId).push({ reminder, timestamp, job: reminderJob });
        break;
      }

      case "list": {
        if (!reminders.has(userId) || reminders.get(userId).length === 0) {
          return await interaction.reply({ content: "> `❌` » Du hast keine Erinnerungen gesetzt.", flags: MessageFlags.Ephemeral });
        }

        const reminderList = reminders.get(userId).map((reminder, index) =>
          `\`${index + 1}.\` **${reminder.reminder}** - <t:${reminder.timestamp}:R>`,
        ).join("\n");

        const listEmbed = new EmbedBuilder()
          .setTitle("Deine Erinnerungen")
          .setDescription(reminderList)
          .setColor("Blurple")
          .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
          .setTimestamp();

        await interaction.reply({ embeds: [listEmbed], flags: MessageFlags.Ephemeral });
        break;
      }

      case "remove": {
        const index = interaction.options.getInteger("reminder") - 1;

        if (!reminders.has(userId) || reminders.get(userId).length === 0) {
          return await interaction.reply({ content: "> `❌` » Du hast keine Erinnerungen gesetzt.", flags: MessageFlags.Ephemeral });
        }

        const userReminders = reminders.get(userId);

        if (index < 0 || index >= userReminders.length) {
          return await interaction.reply({ content: "> `❌` » Ungültiger Index. Bitte überprüfe die Liste deiner Erinnerungen.", flags: MessageFlags.Ephemeral });
        }

        const removedReminder = userReminders.splice(index, 1)[0];


        if(removedReminder.job) {
          removedReminder.job.cancel();
        }


        reminders.set(userId, userReminders);

        const removeEmbed = new EmbedBuilder()
          .setTitle("Erinnerung entfernt")
          .setDescription(`\`🗑️\` » Die Erinnerung **${removedReminder.reminder}** wurde **entfernt**.`)
          .setColor("Red")
          .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
          .setTimestamp();

        await interaction.reply({ embeds: [removeEmbed], flags: MessageFlags.Ephemeral });
        break;
      }
    }
  },
};
