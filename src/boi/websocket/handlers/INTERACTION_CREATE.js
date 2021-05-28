'use strict';

const { Events, InteractionTypes } = require('../../../util/Constants');
let Structures;

module.exports = (boi, { d: data }) => {
  if (data.type === InteractionTypes.APPLICATION_COMMAND) {
    if (!Structures) Structures = require('../../../util/Structures');
    const CommandInteraction = Structures.get('CommandInteraction');

    const interaction = new CommandInteraction(boi, data);

    /**
     * Emitted when an interaction is created.
     * @event Boi#interaction
     * @param {Interaction} interaction The interaction which was created
     */
     boi.emit(Events.INTERACTION_CREATE, interaction);
    return;
  }

  boi.emit(Events.DEBUG, `[INTERACTION] Received interaction with unknown type: ${data.type}`);
};
