'use strict';

// Copied from Etherpad's src/static/js/chat.js.
// TODO: Avoid duplication.
const charEsc = (c) => c === '.' ? '-' : `z${c.charCodeAt(0)}z`;
const authorClass = (authorId) => `author-${authorId.replace(/[^a-y0-9]/g, charEsc)}`;

// In case a translation is missing.
const defaultMsg = {
  join: 'joined the pad',
  leave: 'left the pad',
};

exports.aceEditorCSS = (hookName, context) => ['ep_chat_log_join_leave/static/css/index.css'];

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
  context.rendered.classList.add(authorClass(context.author)); // Mimic default rendering.
  context.rendered.dataset.authorid = context.author; // Mimic default rendering.
  context.rendered.append(timeElt, nameElt, ' ', msgElt);
};
