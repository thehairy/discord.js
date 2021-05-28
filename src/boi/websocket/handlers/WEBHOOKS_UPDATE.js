'use strict';

module.exports = (boi, packet) => {
  boi.actions.WebhooksUpdate.handle(packet.d);
};
