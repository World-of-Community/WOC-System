const { EmbedBuilder } = require("discord.js");
const { COLORS, EMOJIS } = require("../config/constants");

/**
 * Wiederverwendbare Embed-Builder Funktionen
 * Verhindert Code-Duplikation bei Embed-Erstellung
 */
class EmbedHelper {
  /**
     * Erstellt ein Standard-Embed mit vordefinierten Eigenschaften
     */
  static createEmbed({ title, description, color = COLORS.PRIMARY, thumbnail, image, fields = [], footer, timestamp = true }) {
    const embed = new EmbedBuilder()
      .setColor(color);

    if (title) {embed.setTitle(title);}
    if (description) {embed.setDescription(description);}
    if (thumbnail) {embed.setThumbnail(thumbnail);}
    if (image) {embed.setImage(image);}
    if (fields.length > 0) {embed.addFields(fields);}
    if (footer) {embed.setFooter(footer);}
    if (timestamp) {embed.setTimestamp();}

    return embed;
  }

  /**
     * Erstellt ein Erfolgs-Embed
     */
  static success(title, description, fields = []) {
    return this.createEmbed({
      title: `${EMOJIS.SUCCESS} ${title}`,
      description,
      color: COLORS.SUCCESS,
      fields,
    });
  }

  /**
     * Erstellt ein Fehler-Embed
     */
  static error(title, description, fields = []) {
    return this.createEmbed({
      title: `${EMOJIS.ERROR} ${title}`,
      description,
      color: COLORS.ERROR,
      fields,
    });
  }

  /**
     * Erstellt ein Warn-Embed
     */
  static warning(title, description, fields = []) {
    return this.createEmbed({
      title: `${EMOJIS.WARNING} ${title}`,
      description,
      color: COLORS.WARNING,
      fields,
    });
  }

  /**
     * Erstellt ein Info-Embed
     */
  static info(title, description, fields = []) {
    return this.createEmbed({
      title: `${EMOJIS.INFO} ${title}`,
      description,
      color: COLORS.INFO,
      fields,
    });
  }

  /**
     * Erstellt ein Benutzer-Profil Embed
     */
  static userProfile(user, data) {
    return this.createEmbed({
      title: `Profil von ${user.username}`,
      thumbnail: user.displayAvatarURL({ dynamic: true }),
      color: COLORS.PRIMARY,
      fields: [
        { name: "User ID", value: user.id, inline: true },
        { name: "Erstellt am", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        ...data,
      ],
    });
  }

  /**
     * Erstellt ein Leaderboard-Embed
     */
  static leaderboard(title, entries, valueFormatter = (value) => value) {
    const description = entries.map((entry, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
      return `${medal} **${entry.name}** - ${valueFormatter(entry.value)}`;
    }).join("\n");

    return this.createEmbed({
      title: `${EMOJIS.TROPHY} ${title}`,
      description: description || "Keine Einträge vorhanden",
      color: COLORS.PRIMARY,
    });
  }

  /**
     * Erstellt ein Paginierungs-Embed
     */
  static paginated(title, description, page, totalPages, color = COLORS.PRIMARY) {
    return this.createEmbed({
      title,
      description,
      color,
      footer: { text: `Seite ${page}/${totalPages}` },
    });
  }

  /**
     * Erstellt ein Permission-Fehler Embed
     */
  static noPermission(requiredPermission) {
    return this.error(
      "Keine Berechtigung",
      `Du benötigst die Berechtigung **${requiredPermission}** um diesen Befehl auszuführen.`,
    );
  }

  /**
     * Erstellt ein Cooldown-Embed
     */
  static cooldown(timeLeft) {
    const seconds = Math.ceil(timeLeft / 1000);
    return this.warning(
      "Cooldown aktiv",
      `Bitte warte noch **${seconds}** Sekunde${seconds !== 1 ? "n" : ""}.`,
    );
  }
}

module.exports = EmbedHelper;
