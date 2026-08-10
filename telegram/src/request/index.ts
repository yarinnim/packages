import type { Request } from '../type';
import getMessages from './get-messages';
import { createRequest, getMessage } from './common';
import downloadMedia from './download-media';

export default function initRequest(client: any, event: any, options: any): Request {
  const { message } = event;
  const request: any = createRequest(event, options); 
  return {
    ...request,
    message: getMessage(message),
    downloadMedia: downloadMedia.bind(null, client),
    getMessages: getMessages.bind(null, event, options),
  };
}
