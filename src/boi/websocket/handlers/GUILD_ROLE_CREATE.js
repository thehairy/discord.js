'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildRoleCreate.handle(packet.d);
};
