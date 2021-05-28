'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildRoleDelete.handle(packet.d);
};
