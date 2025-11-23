const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const Logger = require('./logger');

/**
 * Permissions Helper
 * Zentrale Funktionen für Permission-Checks
 */
class PermissionHelper {
    /**
     * Prüft ob ein Member eine bestimmte Permission hat
     */
    static hasPermission(member, permission) {
        if (!member || !member.permissions) {
            Logger.warning('PermissionCheck: Invalid member object');
            return false;
        }

        return member.permissions.has(PermissionFlagsBits[permission]);
    }

    /**
     * Prüft ob ein Member Administrator ist
     */
    static isAdmin(member) {
        return this.hasPermission(member, 'Administrator');
    }

    /**
     * Prüft ob ein Member Moderator-Rechte hat
     */
    static isModerator(member) {
        return this.hasPermission(member, 'ModerateMembers') ||
               this.hasPermission(member, 'KickMembers') ||
               this.isAdmin(member);
    }

    /**
     * Prüft ob ein Member eine bestimmte Rolle hat
     */
    static hasRole(member, roleId) {
        if (!member || !member.roles) {
            Logger.warning('RoleCheck: Invalid member object');
            return false;
        }

        return member.roles.cache.has(roleId);
    }

    /**
     * Prüft ob ein Member eine der angegebenen Rollen hat
     */
    static hasAnyRole(member, roleIds) {
        return roleIds.some(roleId => this.hasRole(member, roleId));
    }

    /**
     * Prüft ob ein Member Team-Mitglied ist
     */
    static isTeamMember(member) {
        // Prüfe ob Member Admin ist oder Moderator
        if (this.isAdmin(member) || this.isModerator(member)) {
            return true;
        }

        // Hier könnten weitere Team-Rollen geprüft werden
        return false;
    }

    /**
     * Prüft ob ein Member gebannt ist (Ban-Rolle)
     */
    static isBanned(member) {
        return this.hasRole(member, config.roles.ban);
    }

    /**
     * Prüft ob ein Member verifiziert ist
     */
    static isVerified(member) {
        return this.hasRole(member, config.roles.verify);
    }

    /**
     * Prüft ob der Bot eine bestimmte Permission in einem Channel hat
     */
    static botHasPermission(channel, permission) {
        if (!channel || !channel.guild) {
            return false;
        }

        const botMember = channel.guild.members.me;
        return channel.permissionsFor(botMember).has(PermissionFlagsBits[permission]);
    }

    /**
     * Prüft mehrere Permissions auf einmal
     */
    static hasPermissions(member, permissions) {
        return permissions.every(permission => this.hasPermission(member, permission));
    }

    /**
     * Gibt eine lesbare Fehlermeldung für fehlende Permissions zurück
     */
    static getMissingPermissionsText(member, requiredPermissions) {
        const missing = requiredPermissions.filter(
            permission => !this.hasPermission(member, permission)
        );

        if (missing.length === 0) return null;

        return `Fehlende Berechtigungen: ${missing.join(', ')}`;
    }

    /**
     * Prüft Hierarchie: Kann member das target moderieren?
     */
    static canModerate(member, target) {
        if (!member || !target) return false;

        // Member kann sich selbst nicht moderieren
        if (member.id === target.id) return false;

        // Owner kann jeden moderieren
        if (member.id === member.guild.ownerId) return true;

        // Target ist Owner - niemand kann Owner moderieren
        if (target.id === target.guild.ownerId) return false;

        // Höchste Rolle vergleichen
        return member.roles.highest.position > target.roles.highest.position;
    }
}

module.exports = PermissionHelper;
