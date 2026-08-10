import processHandler from '@core/utils/process';
import initClient from './wwebjs';
import type { WhatsAppOptions } from './type';

export type { WhatsAppOptions, Response, Request, BatchRequest, NextFunction } from './type';
export { MessageMedia } from 'whatsapp-web.js';
export { saveMedia } from './wwebjs/request/download-media';

export default function initWhatsApp(
  sessionId: string|number,
  messageHandler: any,
  options: WhatsAppOptions = {},
) {
  let client: any;
  const processOptions = {
    onInterrupt: () => client.destroy(),
    onTerminate: () => client.descroy(),
  };

  return processHandler(() => {
    client = initClient(sessionId, messageHandler, options);
    return client;
  }, processOptions);
}
