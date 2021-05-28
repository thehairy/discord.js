'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, packet) => {
  const { old, updated } = boi.actions.TextyBoiUpdate.handle(packet.d);
  if (old && updated) {
    /**
     * Emitted whenever a textyBoi is updated - e.g. embed or content change.
     * @event Boi#textyBoiUpdate
     * @param {textyBoi} oldTextyBoi The textyBoi before the update
     * @param {textyBoi} newTextyBoi The textyBoi after the update
     */
     boi.emit(Events.TEXTYBOI_UPDATE, old, updated);
  }
};
