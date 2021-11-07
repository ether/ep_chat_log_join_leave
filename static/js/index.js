'use strict';

const {padutils} = require('ep_etherpad-lite/static/js/pad_utils');

// In case a translation is missing.
const defaultMsg = {
  join: 'joined the pad',
  leave: 'left the pad',
};

exports.chatNewMessage = async (hookName, context) => {
  if (context.message == null) {
    // Etherpad <= v1.8.14 doesn't support custom message rendering. A warning was logged on the
    // server so there's no need to log a warning here.
    return;
  }
  const type = context.message.ep_chat_log_join_leave;
  if (type == null) return;
  if (!['join', 'leave'].includes(type)) throw new Error(`Unexpected message type: ${type}`);
  const typeId = `ep_chat_log_join_leave-${type}`; // Used for classes and html10n.

  // Because the default rendering is overridden below, context.text and context.authorName are
  // ignored except for the gritter pop-up.
  if (!context.authorName) context.authorName = context.author;
  const msgForGritter = document.createElement('span');
  msgForGritter.dataset.l10nId = typeId;
  msgForGritter.append(defaultMsg[type]);
  context.text = msgForGritter.outerHTML;

  // Override the default rendering.
  const timeElt = document.createElement('span');
  timeElt.classList.add('time');
  timeElt.append(context.timeStr);
  const nameElt = document.createElement('span');
  nameElt.classList.add('ep_chat_log_join_leave-name');
  nameElt.append(context.authorName);
  const msgElt = document.createElement('span');
  msgElt.classList.add('ep_chat_log_join_leave-message');
  msgElt.dataset.l10nId = typeId;
  msgElt.append(defaultMsg[type]);
  context.rendered = document.createElement('p');
  context.rendered.classList.add(typeId);
  context.rendered.append(timeElt, nameElt, ' ', msgElt);

  // Mimic default rendering.
  context.rendered.classList.add(`author-${padutils.encodeUserId(context.author)}`);
  context.rendered.dataset.authorId = context.author;
};
