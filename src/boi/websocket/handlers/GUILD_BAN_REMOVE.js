'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildBanRemove.handle(packet.d);
};
