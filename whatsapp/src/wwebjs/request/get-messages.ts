import type { Message } from 'whatsapp-web.js';
import { getMessage, getGroupId } from './common';
import type { PlainRequest, BatchRequest } from '../../type';
import * as state from '../../state';


const isInGroup = (groupId: string, media: any, type: string): boolean => {
  const destGroupId = getGroupId(media, type);
  return groupId === destGroupId;
};

type BatchMessageProps = {
  request: PlainRequest|undefined,
  message: Message,
};

export default function getBatchMessage( bindedProps: BatchMessageProps): Promise<BatchRequest> {
  const { message, request: plainRequest } = bindedProps;
  const { _data: mediaData = false } = message as any;

  const isSingleMessage = !mediaData.parentMsgKey && message.type !== 'album';

  if (isSingleMessage) return Promise.resolve({
    ...plainRequest,
    isPartial: false,
    messages: [getMessage(message)],
  } as BatchRequest);

  const groupId = getGroupId(mediaData, message.type);

  return new Promise((resolve: any) => {
    const storedMessages = state.getState(groupId, []);
    if (storedMessages.length === 0) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        const allMessages = state.getState(groupId);
        state.removeState(groupId);
        resolve({ ...plainRequest, messages: allMessages, isPartial: false });
      }, 1000);
    } else {
      resolve({ ...plainRequest, isPartial: true });
    }

    if (isInGroup(groupId, mediaData, message.type)) {
      const nextMessage = getMessage(message);
      state.setState(groupId, [...storedMessages, nextMessage]);
    }
  });
};
