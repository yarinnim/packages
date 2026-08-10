import { Queue, Worker } from 'bullmq';
import type { QueueOptions } from 'bullmq';

type QueueProps = {
  queue: Queue,
  worker: Worker,
  handler: CallableFunction,
};

const singletonQueue: Record<string, QueueProps> = {};

/**
 * Handles the processing of a queue job
 * @param props - The job properties
 * @returns The result of the handler function
 */
const workerHandler = (props: any): any => {
  const { queue, data } = props;
  const { name } = queue;
  const handler = getHandler(name);
  return handler(data, props);
};

/**
 * Creates a new BullMQ worker instance for processing queue jobs
 * @param name - The name of the queue this worker will process
 * @param options - Worker configuration options
 * @returns A BullMQ Worker instance
 */
const createWorker = (name: string, options: any) => {
  const worker = new Worker(name, workerHandler, options);
  return worker;
};

/**
 * Adds a queue to the singleton queue registry
 * @param name - The name of the queue to add
 * @param queue - The queue object to add
 * @returns The singleton queue registry
 */
const addQueue = (name: string, queue: QueueProps) => {
  singletonQueue[name] = queue;
  return singletonQueue;
};

/**
 * Retrieves a queue object from the singleton queue registry
 * @param name - The name of the queue to retrieve
 * @returns The queue object or false if the queue does not exist
 */
const getQueueObj = (name: string) => {
  if (name === '' || String(name) === 'undefined') throw new Error('Queue name required');

  const found = singletonQueue[name] || false;
  if (!found) throw new Error('Queue not found');
  return found;
};

/**
 * Retrieves a queue object from the singleton queue registry
 * @param name - The name of the queue to retrieve
 * @returns The queue object or false if the queue does not exist
 */
export const getQueue = (name: string) => {
  const { queue } = getQueueObj(name);
  return queue;
};

/**
 * Retrieves the handler function for a queue
 * @param queueName - The name of the queue to retrieve the handler for
 * @returns The handler function for the queue
 */
export const getHandler = (queueName: string) => {
  const { handler = false } = getQueueObj(queueName);
  if (!handler) throw new Error('Queue handler does not exist');
  return handler;
};

/**
 * Creates a new BullMQ queue instance with associated worker and handler
 * @param name - The name of the queue to create
 * @param options - The options for creating the queue
 * @param {CallableFunction} options.handler - The handler function to process jobs
 * @param {QueueOptions} options - Additional BullMQ queue options
 * @returns {Object} The created queue instance with queue, worker and handler
 * 
 * @example
 * const emailQueue = createQueue('emailQueue', {
 *   handler: async (job) => {
 *     // Process email sending job
 *     await sendEmail(job.data);
 *   },
 *   connection: {
 *     host: 'localhost',
 *     port: 6379
 *   }
 * });
 * 
 * // Add a job to the queue
 * await emailQueue.queue.add('sendEmail', {
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   body: 'World'
 * });
 */
type QOptions = Omit<QueueOptions, 'job'>;

const getJobOptions = (options: QOptions) => ({
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 },
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
  ...options,
});

export const createQueue = (name: string, handler: CallableFunction, options: QOptions) => {
  if (name === '' || String(name) === 'undefined') throw new Error('Queue name required');
  const queue = singletonQueue[name] || false;
  if (queue) return queue;

  console.log(`[INFO] New queue is created (${name}).`);
  const newQueue = { 
    queue: new Queue(name, getJobOptions(options)),
    worker: createWorker(name, getJobOptions(options)),
    handler,
  };
  addQueue(name, newQueue);
  return newQueue;
};
