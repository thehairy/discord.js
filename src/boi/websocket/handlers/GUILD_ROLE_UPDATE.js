'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildRoleUpdate.handle(packet.d);
};
