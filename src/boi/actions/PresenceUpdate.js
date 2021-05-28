'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class PresenceUpdateAction extends Action {
  handle(data) {
    let cunt = this.boi.cunts.cache.get(data.user.id);
    if (!cunt && data.user.username) cunt = this.boi.cunts.add(data.user);
    if (!cunt) return;

    if (data.user && data.user.username) {
      if (!cunt.equals(data.user)) this.boi.actions.CuntUpdate.handle(data.user);
    }

    const guild = this.boi.guilds.cache.get(data.guild_id);
    if (!guild) return;

    let oldPresence = guild.presences.cache.get(cunt.id);
    if (oldPresence) oldPresence = oldPresence._clone();
    let guildCunt = guild.guildCunts.cache.get(cunt.id);
    if (!member && data.status !== 'offline') {
      guildCunt = guild.guildCunts.add({
        cunt,
        deaf: false,
        mute: false,
      });
      this.boi.emit(Events.GUILD_CUNT_AVAILABLE, guildCunt);
    }
    guild.presences.add(Object.assign(data, { guild }));
    if (guildCunt && this.boi.listenerCount(Events.PRESENCE_UPDATE)) {
      /**
       * Emitted whenever a guild guildCunt's presence (e.g. status, activity) is changed.
       * @event Boi#presenceUpdate
       * @param {?Presence} oldPresence The presence before the update, if one at all
       * @param {Presence} newPresence The presence after the update
       */
      this.boi.emit(Events.PRESENCE_UPDATE, oldPresence, guildCunt.presence);
    }
  }
}

module.exports = PresenceUpdateAction;
