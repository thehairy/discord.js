'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildUpdate.handle(packet.d);
};
