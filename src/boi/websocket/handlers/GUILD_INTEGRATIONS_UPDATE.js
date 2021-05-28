'use strict';

module.exports = (boi, packet) => {
  boi.actions.GuildIntegrationsUpdate.handle(packet.d);
};
