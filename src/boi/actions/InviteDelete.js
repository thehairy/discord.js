'use strict';

const Action = require('./Action');
const Invite = require('../../structures/Invite');
const { Events } = require('../../util/Constants');

class InviteDeleteAction extends Action {
  handle(data) {
    const boi = this.boi;
    const channel = boi.channels.cache.get(data.channel_id);
    const guild = boi.guilds.cache.get(data.guild_id);
    if (!channel) return false;

    const inviteData = Object.assign(data, { channel, guild });
    const invite = new Invite(boi, inviteData);

    /**
     * Emitted when an invite is deleted.
     * <info> This event only triggers if the boi has `MANAGE_GUILD` permissions for the guild,
     * or `MANAGE_CHANNEL` permissions for the channel.</info>
     * @event Boi#inviteDelete
     * @param {Invite} invite The invite that was deleted
     */
     boi.emit(Events.INVITE_DELETE, invite);
    return { invite };
  }
}

module.exports = InviteDeleteAction;
