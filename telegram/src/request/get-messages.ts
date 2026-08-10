import type { BatchRequest } from '../type';
import { getMessage, createRequest } from './common';
import * as state from '../state';

const isOfGroup = (message: any, pGroupedId: string) => {
  const { groupedId } = message;
  return `grouped-${parseInt(groupedId, 10)}` === pGroupedId;
};

export default function getMessages(event: any, options: any): Promise<BatchRequest|any> {
  const { message } = event;
  const { groupedId } = message;
  const request = createRequest(event, options);
  if (!(groupedId || false)) {
    const result: BatchRequest = { ...request, messages: [getMessage(message)] };
    return Promise.resolve(result);
  }

  return new Promise((resolve) => {
    const groupId = `grouped-${parseInt(groupedId, 10)}`;
    const storedMessages = state.getState(groupId, []);
    if (storedMessages.length === 0) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        const finalMessages = state.getState(groupId);
        state.removeState(groupId);
        const result = {
          ...request,
          messages: finalMessages,
        };
        return resolve(result);
      }, 500);
    }

    if (isOfGroup(message, groupId)) {
      const curMsg = getMessage(message);
      state.setState(groupId, [...storedMessages, curMsg]);
    }
  });

}
