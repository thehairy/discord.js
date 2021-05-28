'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildDelete.handle(packet.d);
};
