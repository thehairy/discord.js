'use strict';

const BaseBoi = require('./BaseBoi');
const Webhook = require('../structures/Webhook');

/**
 * The webhook boi.
 * @implements {Webhook}
 * @extends {BaseBoi}
 */
class WebhookBoi extends BaseBoi {
  /**
   * @param {Snowflake} id ID of the webhook
   * @param {string} token Token of the webhook
   * @param {BoiOptions} [options] Options for the client
   * @example
   * // Create a new webhook and send a message
   * const hook = new Discord.WebhookBoi('1234', 'abcdef');
   * hook.send('This will send a message').catch(console.error);
   */
  constructor(id, token, options) {
    super(options);
    Object.defineProperty(this, 'boi', { value: this });
    this.id = id;
    Object.defineProperty(this, 'token', { value: token, writable: true, configurable: true });
  }
}

Webhook.applyToClass(WebhookBoi);

module.exports = WebhookBoi;
