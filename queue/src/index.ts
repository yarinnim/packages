import type { QueueOptions, Queue } from './type';
import { createQueue, getQueue } from './queue';

/**
 * Initializes and manages a queue system using BullMQ
 * @param {Queue} props - Configuration object for the queue
 * @param {Record<string, CallableFunction>} props.job - Map of job names to their handler functions
 * @param {QueueOptions} props - Additional BullMQ queue options like connection settings
 * @returns {QueueInstance} Queue management interface
 * @property {Function} QueueInstance.createQueue - Creates a new queue with the given name and inherited options
 * @property {Function} QueueInstance.getQueue - Retrieves an existing queue by name
 * 
 * @example
 * const queueSystem = initQueue({
 *   job: {
 *     emailJob: async (job) => { // handle email sending },
 *     processData: async (job) => { // handle data processing }
 *   },
 *   connection: {
 *     host: 'localhost',      // Redis server hostname
 *     port: 6379,            // Redis server port
 *     username: 'default',    // Redis username (optional)
 *     password: 'secret',     // Redis password (optional)
 *     db: 0,                 // Redis database index
 *     tls: false,            // Enable TLS/SSL
 *     retryStrategy: (times) => Math.min(times * 50, 2000), // Retry connection strategy
 *     maxRetriesPerRequest: 3, // Max retries per request
 *     enableReadyCheck: true,  // Check if Redis is ready
 *     keepAlive: 5000,        // Keep-alive timeout in ms
 *     connectTimeout: 10000    // Connection timeout in ms
 *   }
 * });
 * 
 * // Get existing queue
 * const emailQueue = queueSystem.getQueue('emailJob');
 * 
 * // Create new queue
 * const newQueue = queueSystem.createQueue('customQueue');
 */

let instance: Queue | false = false;

export default function initQueue(props: QueueOptions): Queue {
  const { job, ...queueOptions } = props;
  if (instance || false) return instance;

  const keys = Object.keys(job);
  keys.forEach((key: string) => createQueue(key, job[key], queueOptions));

  type JobKeys = keyof typeof job;
  instance = {
    createQueue: (
      name: string,
      handler: CallableFunction,
      options: any = {},
    ) => createQueue(name, handler, { ...queueOptions, ...options }),
    getQueue: <J extends JobKeys>(name: J) => getQueue(name),
  };
  return instance;
}
