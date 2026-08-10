import { QueueOptions as OriginQueueOptions } from 'bullmq';

export type QueueOptions = OriginQueueOptions & {
  job: Record<string, CallableFunction>,
};

export type Queue = {
  createQueue: CallableFunction,
  getQueue: CallableFunction,
}

