'use strict';

const ChatMessage = (() => {
  try {
    return require('ep_etherpad-lite/static/js/ChatMessage');
  } catch (err) {
    return null;
  }
})();
const log4js = require('ep_etherpad-lite/node_modules/log4js');
const padMessageHandler = require('ep_etherpad-lite/node/handler/PadMessageHandler');

const logger = log4js.getLogger('ep_chat_log_join_leave');

/**
 * How long to wait until a disconnected user is declared gone. (Network flakiness could cause a
 * user to briefly disconnect and reconnect. Those shouldn't appear in the chat history.)
 *
 * TODO: Make configurable.
 */
const timeout = 10000;

/**
 * Maps a pad ID to another map that maps an author ID to null (if the user is currently connected)
 * or to a timeout ID for a timeout that will fire when the user has been gone long enough to inform
 * users (if the user recently disconnected).
 *
 * @type {Map<string, Map<string, number>>}
 */
const activeUsersPerPad = new Map();

exports.eejsBlock_styles = (hookName, context) => {
  const css = 'ep_chat_log_join_leave/static/css/index.css';
  context.content += `<link href="../static/plugins/${css}" rel="stylesheet">`;
};

exports.userJoin = async (hookName, {authorId, padId}) => {
  if (!activeUsersPerPad.has(padId)) activeUsersPerPad.set(padId, new Map());
  const activeUsers = activeUsersPerPad.get(padId);
  if (activeUsers.has(authorId)) {
    clearTimeout(activeUsers.get(authorId));
  } else if (ChatMessage != null) {
    // Etherpad >= v1.8.15.
    const msg = new ChatMessage('', authorId, Date.now());
    msg.ep_chat_log_join_leave = 'join';
    await padMessageHandler.sendChatMessageToPadClients(msg, padId);
  } else {
    // Etherpad <= v1.8.14.
    logger.warn('This version of Etherpad does not support custom chat message rendering. ' +
                'Please upgrade to Etherpad v1.8.15 or later.');
    const txt = 'joined the pad'; // User must upgrade Etherpad to >= v1.8.15 to localize this.
    await padMessageHandler.sendChatMessageToPadClients(Date.now(), authorId, txt, padId);
  }
  activeUsers.set(authorId, null);
};

exports.userLeave = async (hookName, {authorId, padId}) => {
  // TODO: l10n
  const activeUsers = activeUsersPerPad.get(padId);
  clearTimeout(activeUsers.get(authorId));
  activeUsers.set(authorId, setTimeout(async () => {
    activeUsers.delete(authorId);
    if (activeUsers.size === 0) activeUsersPerPad.delete(padId);
    const when = Date.now() - timeout;
    if (ChatMessage != null) {
      // Etherpad >= v1.8.15.
      const msg = new ChatMessage('', authorId, when);
      msg.ep_chat_log_join_leave = 'leave';
      await padMessageHandler.sendChatMessageToPadClients(msg, padId);
    } else {
      // Etherpad <= v1.8.14. Warning was logged when the user joined, no need to repeat it.
      const txt = 'left the pad'; // User must upgrade Etherpad to >= v1.8.15 to localize this.
      await padMessageHandler.sendChatMessageToPadClients(when, authorId, txt, padId);
    }
  }, timeout));
};
