'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class WebhooksUpdate extends Action {
  handle(data) {
    const boi = this.boi;
    const channel = boi.channels.cache.get(data.channel_id);
    /**
     * Emitted whenever a guild text channel has its webhooks changed.
     * @event Boi#webhookUpdate
     * @param {TextChannel} channel The channel that had a webhook update
     */
    if (channel) boi.emit(Events.WEBHOOKS_UPDATE, channel);
  }
}

module.exports = WebhooksUpdate;
