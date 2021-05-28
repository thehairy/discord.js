'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, { d: data }) => {
  let command;

  if (data.guild_id) {
    const guild = boi.guilds.cache.get(data.guild_id);
    if (!guild) return;
    command = guild.commands.add(data);
    guild.commands.cache.delete(data.id);
  } else {
    command = boi.application.commands.add(data);
    boi.application.commands.cache.delete(data.id);
  }

  /**
   * Emitted when an application command is deleted.
   * @event Boi#applicationCommandDelete
   * @param {ApplicationCommand} command The command which was deleted
   */
   boi.emit(Events.APPLICATION_COMMAND_DELETE, command);
};
