'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildEmojiCreateAction extends Action {
  handle(guild, createdEmoji) {
    const already = guild.emojis.cache.has(createdEmoji.id);
    const emoji = guild.emojis.add(createdEmoji);
    /**
     * Emitted whenever a custom emoji is created in a guild.
     * @event Boi#emojiCreate
     * @param {GuildEmoji} emoji The emoji that was created
     */
    if (!already) this.boi.emit(Events.GUILD_EMOJI_CREATE, emoji);
    return { emoji };
  }
}

module.exports = GuildEmojiCreateAction;
