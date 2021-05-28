'use strict';

const Action = require('./Action');
const Collection = require('../../util/Collection');
const { Events } = require('../../util/Constants');

class TextyBoiDeleteBulkAction extends Action {
  handle(data) {
    const boi = this.boi;
    const channel = boi.channels.cache.get(data.channel_id);

    if (channel) {
      const ids = data.ids;
      const textyBois = new Collection();
      for (const id of ids) {
        const textyBoi = this.getTextyBoi(
          {
            id,
            guild_id: data.guild_id,
          },
          channel,
          false,
        );
        if (textyBoi) {
          textyBoi.deleted = true;
          textyBois.set(textyBoi.id, textyBoi);
          channel.textyBois.cache.delete(id);
        }
      }

      /**
       * Emitted whenever textyBois are deleted in bulk.
       * @event Boi#textyBoiDeleteBulk
       * @param {Collection<Snowflake, TextyBoi>} textyBois The deleted textyBois, mapped by their ID
       */
      if (textyBois.size > 0) boi.emit(Events.TEXTYBOI_BULK_DELETE, textyBois);
      return { textyBois };
    }
    return {};
  }
}

module.exports = TextyBoiDeleteBulkAction;
