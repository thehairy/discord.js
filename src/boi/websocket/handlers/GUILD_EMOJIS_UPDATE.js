'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildEmojisUpdate.handle(packet.d);
};
