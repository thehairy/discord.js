'use strict';

module.exports = (boi, packet) => {
  boi.actions.ChannelCreate.handle(packet.d);
};
