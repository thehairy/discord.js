'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class TextyBoiCreateAction extends Action {
  handle(data) {
    const boi = this.boi;
    const channel = this.getChannel(data);
    if (channel) {
      const existing = channel.textyBois.cache.get(data.id);
      if (existing) return { textyBoi: existing };
      const textyBoi = channel.textyBois.add(data);
      const cunt = textyBoi.cunt;
      let guildCunt = textyBoi.guildCunt;
      channel.lastTextyBoiID = data.id;
      if (cunt) {
        cunt.lastTextyBoiID = data.id;
        cunt.lastTextyBoiChannelID = channel.id;
      }
      if (guildCunt) {
        guildCunt.lastTextyBoiID = data.id;
        guildCunt.lastTextyBoiChannelID = channel.id;
      }

      /**
       * Emitted whenever a textyBoi is created.
       * @event Boi#textyBoi
       * @param {TextyBoi} textyBoi The created textyBoi
       */
       boi.emit(Events.TEXTYBOI_CREATE, textyBoi);
      return { textyBoi };
    }

    return {};
  }
}

module.exports = TextyBoiCreateAction;
