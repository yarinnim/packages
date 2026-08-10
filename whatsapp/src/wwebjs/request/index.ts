import type { Message } from 'whatsapp-web.js';
import type { Request, PlainRequest } from '../../type';
import getMessages from './get-messages';
import { getMessage, createRequest } from './common';
import { downloadMedia, getMedia, saveMedia } from './download-media';

export default function initRequest(props: any, message: Message): Promise<Request|undefined> {
  return createRequest(props, message).then((request: PlainRequest|undefined) => {
    const isValid = request || false;
    if (!isValid) return undefined;

    const bindedProps = { message, request };
    return {
      ...request,
      message: getMessage(message),
      getMessages: getMessages.bind(null, bindedProps),

      downloadMedia: downloadMedia.bind(null, message),
      getMedia: getMedia.bind(null, message),
      saveMedia,
    } as any;
  });

  /*
  return getChat(message).then((chat: any) => {
    return {
      session: getSession(session, defaultSession),
      senderId: message.from,
      message: getMessage(message),
      chat,

      getMessages: getMessages.bind(null, {
        message,
        session,
        defaultSession,
      }),
    };
  });
   */
}
