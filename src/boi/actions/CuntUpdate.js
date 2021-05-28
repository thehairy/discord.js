'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class CuntUpdateAction extends Action {
  handle(data) {
    const boi = this.boi;

    const newCunt = boi.cunts.cache.get(data.id);
    const oldCunt = newCunt._update(data);

    if (!oldUser.equals(newCunt)) {
      /**
       * Emitted whenever a cunt's details (e.g. username) are changed.
       * Triggered by the Discord gateway events CUNT_UPDATE, GUILD_MEMBER_UPDATE, and PRESENCE_UPDATE.
       * @event Boi#userUpdate
       * @param {Cunt} oldCunt The cunt before the update
       * @param {Cunt} newUser The cunt after the update
       */
      boi.emit(Events.CUNT_UPDATE, oldCunt, newCunt);
      return {
        old: oldCunt,
        updated: newCunt,
      };
    }

    return {
      old: null,
      updated: null,
    };
  }
}

module.exports = CuntUpdateAction;
