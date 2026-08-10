/* eslint-disable no-console */
import type { TelegramClient } from 'telegram';
import type { Handler } from './type';
import initResponse from './response';
import initRequest from './request';
import initPipeline from './pipline-executor';

type EventProps = {
  client: TelegramClient,
  handlers: Handler[],
  session: any,
};

export default function initEvent(props: EventProps, event: any): Promise<any> {
  const { client, session } = props;
  if (event.message?.out || false) return Promise.resolve(true);

  try {

    const { handlers }: any = props;
    const request = initRequest(client, event, { session });
    const response = initResponse(client, event);

    const { message } = event;
    const executePipeline = initPipeline(handlers);
    if (message.groupedId || false) {
      console.log(message.groupId);
      return executePipeline(request, response);
    }

    return executePipeline(request, response);
  } catch (error: any) {
    const { message } = error;
    console.error(`[ERROR] ${message}`);
    throw error;
  }
}
