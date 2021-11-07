'use strict';

const ChatMessage = (() => {
  try {
    return require('ep_etherpad-lite/static/js/ChatMessage');
  } catch (err) {
    return null;
  }
})();
const assert = require('assert').strict;
const log4js = require('ep_etherpad-lite/node_modules/log4js');
const padMessageHandler = require('ep_etherpad-lite/node/handler/PadMessageHandler');

const logger = log4js.getLogger('ep_chat_log_join_leave');

if (ChatMessage == null) {
  logger.error('This version of Etherpad is unsupported. ' +
               'Please upgrade to Etherpad v1.8.15 or later to use this plugin.');
}

/**
 * How long to wait until a disconnected user is declared gone. (Network flakiness could cause a
 * user to briefly disconnect and reconnect. Those shouldn't appear in the chat history.)
 *
 * TODO: Make configurable.
 */
const timeout = 10000;

/**
 * Maps a {padId, authorId} pair to null (if the user is currently connected) or to an ID for a
 * timeout that will fire when the recently disconnected user has been gone long enough to inform
 * users about the departure.
 */
const activeUsers = new class {
  constructor() {
    /**
     * Maps a pad ID to another map that maps an author ID to null or a timeout ID.
     *
     * @type {Map<string, Map<string, number>>}
     */
    this._users = new Map();
  }

  has(padId, authorId) {
    return this._users.has(padId) && this._users.get(padId).has(authorId);
  }

  get(padId, authorId) {
    const m = this._users.get(padId);
    return m && m.get(authorId);
  }

  set(padId, authorId, value) {
    if (!this._users.has(padId)) this._users.set(padId, new Map());
    this._users.get(padId).set(authorId, value);
  }

  delete(padId, authorId) {
    const m = this._users.get(padId);
    if (m == null) return;
    m.delete(authorId);
    if (m.size === 0) this._users.delete(padId);
  }
}();

exports.eejsBlock_styles = (hookName, context) => {
  if (ChatMessage == null) return;
  const css = 'ep_chat_log_join_leave/static/css/index.css';
  context.content += `<link href="../static/plugins/${css}" rel="stylesheet">`;
};

exports.userJoin = async (hookName, {authorId, padId}) => {
  if (ChatMessage == null) return;
  assert.equal(typeof authorId, 'string');
  assert.equal(typeof padId, 'string');
  const timeout = activeUsers.get(padId, authorId);
  if (timeout) {
    clearTimeout(activeUsers.get(authorId));
  } else {
    const msg = new ChatMessage('', authorId, Date.now());
    msg.ep_chat_log_join_leave = 'join';
    await padMessageHandler.sendChatMessageToPadClients(msg, padId);
  }
  activeUsers.set(padId, authorId, null);
};

exports.userLeave = async (hookName, {authorId, padId}) => {
  if (ChatMessage == null) return;
  // With Etherpad <= v1.8.14, the userLeave event can fire with a nullish padId if the user
  // disconnected before sending a CLIENT_READY message.
  if (padId == null) return;
  assert.equal(typeof authorId, 'string');
  assert.equal(typeof padId, 'string');
  clearTimeout(activeUsers.get(padId, authorId));
  activeUsers.set(padId, authorId, setTimeout(async () => {
    activeUsers.delete(padId, authorId);
    const when = Date.now() - timeout;
    const msg = new ChatMessage('', authorId, when);
    msg.ep_chat_log_join_leave = 'leave';
    await padMessageHandler.sendChatMessageToPadClients(msg, padId);
  }, timeout));
};
