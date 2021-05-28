'use strict';

module.exports = (boi, packet) => {
  boi.actions.ChannelDelete.handle(packet.d);
};
