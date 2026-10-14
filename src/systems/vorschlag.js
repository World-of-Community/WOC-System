import { EmbedBuilder, ChannelType } from "discord.js";
import client from "#client";
import vorschlagEmitter from "./vorschlagEmitter.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

const log = logger.child("Vorschlag");

const VOTES_FIELD_NAME = "`📊` - **Nützlich?**";
const HINT_FIELD_NAME = "`💡` - **Vorschläge**";

export function extractUserId(embed) {
  const match = embed?.footer?.text?.match(/»\s+(\d{17,19})$/);
  return match ? match[1] : null;
}

// Re-creates the user's forum post under the bot's name so the bot owns the embed, then deletes the original.
export async function handleThreadCreate(thread) {
  if (thread.ownerId === settings.get("bots.system")) {return;}
  if (thread.parentId !== settings.get("channels.suggestions")) {return;}

  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild?.channels.cache.get(settings.get("channels.suggestions"));
  if (!channel) {return;}

  const member = await guild.members.fetch(thread.ownerId);
  const message = await thread.fetchStarterMessage();

  const tags = thread.appliedTags ?? [];
  const categoryTags = settings.get("suggestions.categoryTags") ?? {};
  const matchedTagText = tags.map((id) => categoryTags[id]).find(Boolean) ?? "`❌` - **Tag wurde nicht gefunden**";

  const newThread = await channel.threads.create({
    name: thread.name,
    message: { content: "`⚙️` - Bitte warten, Ich erfasse die Daten." },
    appliedTags: tags,
  });

  const embed = new EmbedBuilder()
    .setTitle(`\`🔎\` **- ${thread.name}**`)
    .setDescription(`⠀\n> ${message}\n⠀\n**────────────────────────────**`)
    .addFields(
      { name: "`📚` - **Kategorie**", value: `» ${matchedTagText}`, inline: true },
      { name: VOTES_FIELD_NAME, value: `» Votes: \`0\` <a:upvote:${settings.get("suggestions.upvoteEmoji")}>`, inline: true },
      { name: HINT_FIELD_NAME, value: "> Erstelle einen Post um deine eigenen Vorschlag einzureichen" },
    )
    .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1269340269246025872/Idee.png?ex=66b4fabf&is=66b3a93f&hm=962b53d930a743aee4a4836af336ae3aa912520db34bf6d1467d73a43fe3b3c0&")
    .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340833887424552/WOC_Banner_Server_Idee_Eingereicht.png?ex=66b4fb46&is=66b3a9c6&hm=ba66896d82bb10487f8e52a294cf2b259de2bfc54bf08bc25a68054496933959&")
    .setColor("Orange")
    .setFooter({ text: `» Eingereicht von ${member.user.username} » ${member.id}`, iconURL: member.displayAvatarURL({ dynamic: true }) });

  const starter = await newThread.fetchStarterMessage();
  await starter.react(settings.get("suggestions.upvoteEmoji"));
  await starter.react(settings.get("suggestions.downvoteEmoji"));
  await starter.edit({ content: `\`👋\` » Hey ${member}, Ich habe die Idee (**${thread.name}**) für dich eingereicht.`, embeds: [embed] });
  await thread.delete();
  log.info(`Suggestion taken over: "${thread.name}" by ${member.user.username}`);
}

export async function handleVoteChange(reaction, user) {
  if (user.bot) {return;}
  if (reaction.message.channel.type !== ChannelType.PublicThread) {return;}
  if (reaction.message.channel.parentId !== settings.get("channels.suggestions")) {return;}
  if (reaction.emoji.id !== settings.get("suggestions.upvoteEmoji")) {return;}

  const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
  const embed = message.embeds[0];
  if (!embed) {return;}

  const reactionEmoji = message.reactions.cache.find((r) => r.emoji.id === settings.get("suggestions.upvoteEmoji"));
  if (!reactionEmoji) {return;}

  // the bot's own reaction doesn't count
  const upvoteCount = Math.max(reactionEmoji.count - 1, 0);

  const updated = EmbedBuilder.from(embed);
  const fields = updated.data.fields ?? [];
  const index = fields.findIndex((field) => field.name === VOTES_FIELD_NAME);
  if (index === -1) {return;}

  fields[index].value = `» Votes: \`${upvoteCount}\` <a:upvote:${settings.get("suggestions.upvoteEmoji")}>`;
  updated.setFields(fields);

  await message.edit({ embeds: [updated] });
}

export async function finalizeVorschlag(interaction, {
  status,
  grund,
  tags,
  replaceTags = false,
  authorPrefix,
  fieldName,
  fieldValue,
  color,
  thumbnail,
  image,
  replyText,
}) {
  const channel = interaction.channel;
  const message = await channel.fetchStarterMessage();
  const original = message.embeds[0];
  if (!original) {
    await interaction.reply({ content: "> `❌` » Vorschlags-Embed nicht gefunden.", ephemeral: true });
    return;
  }

  const currentTags = replaceTags ? [] : [...(channel.appliedTags ?? [])];
  for (const tag of (typeof tags === "function" ? tags() : tags)) {
    if (!currentTags.includes(tag)) {currentTags.push(tag);}
  }
  await channel.setAppliedTags(currentTags);

  const updatedFields = (original.fields ?? []).filter((field) => field.name !== HINT_FIELD_NAME);
  const member = interaction.member;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `» ${authorPrefix} ${member.user.displayName}`,
      iconURL: member.user.displayAvatarURL(),
      url: `https://discordapp.com/users/${member.user.id}`,
    })
    .setTitle(original.title)
    .setDescription(original.description)
    .addFields(...updatedFields, { name: fieldName, value: `${fieldValue}\nGrund: \`${grund}\`` })
    .setColor(color)
    .setThumbnail(thumbnail)
    .setImage(image)
    .setFooter(original.footer);

  await message.edit({ embeds: [embed], components: [] });
  await message.reactions.removeAll().catch(() => {});
  await channel.setLocked(true).catch(() => {});

  if (status === "accept") {
    vorschlagEmitter.emit("accept", interaction);
  }

  const userID = extractUserId(original);
  if (userID) {
    const user = await interaction.client.users.fetch(userID).catch(() => null);
    await user?.send(`Hey, ${user} » Dein Vorschlag auf **World Of Community** wurde gerade bearbeitet!\n> zum Vorschlag: ${message.url}`).catch(() => {});
  } else {
    log.warn("Could not read user id from suggestion embed");
  }

  await interaction.reply({ content: replyText, ephemeral: true });
}

export const STATUS_PRESETS = Object.freeze({
  accept: {
    status: "accept",
    tags: () => [settings.get("suggestions.tagAccepted")],
    authorPrefix: "Akzeptiert von",
    fieldName: "`✅` » **Status**",
    fieldValue: "» Dieser Vorschlag wurde von unserem Server-Team akzeptiert.",
    color: "Green",
    thumbnail: "https://cdn.discordapp.com/attachments/1269339944766144574/1269340142326513705/akzeptiert.png?ex=66b4faa1&is=66b3a921&hm=de05f1242d66e1bb6aba76b120f69f5fe4afa81def74bc60f3a741d294c4d688&",
    image: "https://cdn.discordapp.com/attachments/1269339771420016722/1269340862265950219/WOC_Banner_Server_Idee_Akzeptiert.png?ex=66b4fb4c&is=66b3a9cc&hm=7ed09aa66a49748f9ae9708fa5750baefcdbdd087545792428ce5095c0c17353&",
    replyText: "`✅` » Der Vorschlag wurde als **angenommen** markiert.",
  },
  edit: {
    status: "edit",
    tags: () => [settings.get("suggestions.tagPlanned")],
    authorPrefix: "Bearbeitet von",
    fieldName: "`🚧` » **Status**",
    fieldValue: "» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.",
    color: "Orange",
    thumbnail: "https://cdn.discordapp.com/attachments/1269339944766144574/1269340099875835975/bearbeitung.png?ex=66b4fa97&is=66b3a917&hm=d6fa6354b16fa6bc5aa0293d461635fb4fb46cc535e4393d67e506730be358fd&",
    image: "https://cdn.discordapp.com/attachments/1269339771420016722/1269340799674351796/WOC_Banner_Server_Idee_in_Planung.png?ex=66b4fb3d&is=66b3a9bd&hm=42c46c93749ec918420bdfe758b8f8409b86836645671fadbeeb562fb2540a32&",
    replyText: "`✅` » Der Vorschlag wurde als **in Planung** markiert.",
  },
  delice: {
    status: "delice",
    tags: () => [settings.get("suggestions.tagRejected")],
    replaceTags: true,
    authorPrefix: "Abgelehnt von",
    fieldName: "`❌` » **Status**",
    fieldValue: "» Dieser Vorschlag wurde von unserem Server-Team abgelehnt.",
    color: "Red",
    thumbnail: "https://cdn.discordapp.com/attachments/1269339944766144574/1269339986394878125/abgelehnt.png?ex=66b4fa7b&is=66b3a8fb&hm=59207d85f9b5317312d6d2bd6eba5f79af2f2f62fc9b96babb944cc8d293acc5&",
    image: "https://cdn.discordapp.com/attachments/1269339771420016722/1269340888048341003/WOC_Banner_Server_Idee_Abgelehnt.png?ex=66b4fb52&is=66b3a9d2&hm=443627b29e194bba0081e2443646fb757573a435b40af224b44bf5f6956caccf&",
    replyText: "`✅` »  Der Vorschlag wurde als **Abgelehnt** markiert.",
  },
  duplicate: {
    status: "duplicate",
    grund: "Doppelter Vorschlag. Bitte nutze die Suche!",
    tags: () => [settings.get("suggestions.tagDuplicate")],
    authorPrefix: "Bearbeitet von",
    fieldName: "`🔗` » **Status**",
    fieldValue: "» Dieser Vorschlag ist Doppelt und wurde bereits bearbeitet.",
    color: "Yellow",
    thumbnail: "https://cdn.discordapp.com/attachments/1269339944766144574/1269340060579270756/link.png?ex=66b4fa8d&is=66b3a90d&hm=e7c7a2b53b0bde6ae01f01d3732cc59132059c8a025286c1f892cbfb7139449c&",
    image: "https://cdn.discordapp.com/attachments/1269339771420016722/1269340319288393800/WOC_Banner_Server_Idee_Doppelt.png?ex=66b4facb&is=66b3a94b&hm=8ab1aff62cd7b7ffe20845e056bd3fa6c08b2ed92383d58d98204e2d9ff424c7&",
    replyText: "`✅` » Der Vorschlag wurde als **Doppelt** markiert.",
  },
});
