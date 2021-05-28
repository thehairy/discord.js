'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildIntegrationsUpdate extends Action {
  handle(data) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);
    /**
     * Emitted whenever a guild integration is updated
     * @event Boi#guildIntegrationsUpdate
     * @param {Guild} guild The guild whose integrations were updated
     */
    if (guild) boi.emit(Events.GUILD_INTEGRATIONS_UPDATE, guild);
  }
}

module.exports = GuildIntegrationsUpdate;
