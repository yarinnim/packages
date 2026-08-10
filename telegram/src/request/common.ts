import getMedia from './media';

const chatType = {
  PRIVATE: 'private',
  CHANNEL: 'channel',
  GROUP: 'group',
  UNKNOWN: 'unknown',
};

const getChatType = (peerId: any) => {
  const isPrivate = peerId.userId || false;
  if (isPrivate) return chatType.PRIVATE;

  const isChannel = peerId.channelId || false;
  if (isChannel) return chatType.CHANNEL;

  const isGroup = peerId.chatId || false;
  if (isGroup) return chatType.GROUP;

  return chatType.UNKNOWN;
};

export const getChat = (message: any) => {
  const { peerId } = message;
  const chatId: number = parseInt(peerId.chatId || peerId.channelId || peerId.userId, 10);
  const chatType: string = getChatType(peerId);
  return { id: chatId, type: chatType };
};

export const getMessage = (pMessage: any) => {
  const { id, message, peerId } = pMessage;
  return { 
    id, message, peerId, 
    media: getMedia(pMessage),
    groupedId: getGroupedId(pMessage),
  };
};

type RequestOptions = {
  session: any,
};

const getGroupedId = (message: any) => {
  const { groupedId = undefined } = message;
  if (!(groupedId || false)) return undefined;
  return parseInt(groupedId, 10);
    
};
export const createRequest = (event: any, options: RequestOptions) => {
  const { session } = options;
  const { message } = event;
  const { fromId } = message;
  const senderId: number = parseInt(fromId?.userId || '0', 10);

  const result = {
    chat: getChat(message), 
    senderId,
    session,
    peerId: message.peerId,
  };
  return result;
};

