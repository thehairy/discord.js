'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildBanAdd.handle(packet.d);
};
