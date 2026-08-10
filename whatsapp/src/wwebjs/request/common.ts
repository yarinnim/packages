import type { Message, Chat } from 'whatsapp-web.js';
import type { RequestChat, PlainRequest } from '../../type';
import getMessageMedia from './media';

export const getGroupId = (media: any, type: string): string => {
  const groupId = type === 'album' ? media.id.id : media.parentMsgKey.id;
  return groupId;
};

export const getChat = (message: Message): Promise<RequestChat> => message
  .getChat()
  // .then((ca: any) => { console.log({ ca }); return ca; })
  .then((chat: Chat) => ({
    id: chat.id._serialized,
    name: chat.name,
    isGroup: chat.isGroup,
  }));

export const getSession = (session: any, defaultSession: any = {}) => ({
  ...defaultSession,
  id: session.id,
  lastActivity: session.lastActivity,
  destroy: session.destroy,
});

export const getMessage = (message: Message) => ({
  id: message.id.id || 'N/A',
  serializedId: message.id._serialized,
  message: message.body,
  type: message.type,
  // groupedId: getGroupId((message as any)._data, message.type),
  media: getMessageMedia(message),
});

export const createRequest = (
  bindedProps: any,
  message: Message,
): Promise<PlainRequest|undefined> => {
  const { fromMe } = message;
  if (fromMe) return Promise.resolve(undefined);

  const { session, defaultSession } = bindedProps;

  return getChat(message).then((chat: RequestChat) => ({
    chat,
    senderId: message.from,
    session: getSession(session, defaultSession),
  }) as any);
};
