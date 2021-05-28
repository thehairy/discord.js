'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, packet) => {
  const { old, updated } = boi.actions.ChannelUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
     * @event Boi#channelUpdate
     * @param {DMChannel|GuildChannel} oldChannel The channel before the update
     * @param {DMChannel|GuildChannel} newChannel The channel after the update
     */
     boi.emit(Events.CHANNEL_UPDATE, old, updated);
  }
};
