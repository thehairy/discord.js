'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class TextyBoiDeleteAction extends Action {
  handle(data) {
    const boi = this.boi;
    const channel = this.getChannel(data);
    let textyBoi;
    if (channel) {
      textyBoi = this.getTextyBoi(data, channel);
      if (textyBoi) {
        channel.textyBois.cache.delete(textyBoi.id);
        textyBoi.deleted = true;
        /**
         * Emitted whenever a textyBoi is deleted.
         * @event Boi#textyBoiDelete
         * @param {TextyBoi} textyBoi The deleted textyBoi
         */
         boi.emit(Events.TEXTYBOI_DELETE, textyBoi);
      }
    }

    return { textyBoi };
  }
}

module.exports = TextyBoiDeleteAction;
