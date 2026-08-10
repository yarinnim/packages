# Queue

Queue is a local package in-house develop based on the [BullMQ](https://docs.bullmq.io).
General description of BullMQ and its features BullMQ is a Node.js library that implements
a fast and robust queue system built on top of Redis that helps in resolving many modern
age micro-services architectures.

## Installation

Add the package to ``package.json``

```json
"dependencies": {
  "@core/queue": "^1.0.0",
}
```
 Add the package code-base to ``tsconfig.json``

 ```json
 "references": [
   {"path": "../../packages/queue"}
 ]
```

## How to use

### Initialization

To initialize it, we need to define the job handler, and connection to Redis.
The connect to Redis can by flat object or ``connection`` object from ``ioredis``
or ``node-redis`` connection. The following example is to create the function
to initialize the queue with job handler (``handler``) and the redis connection
(``redisCon``). The example declare two job ``send-mail`` and ``process-image``.

```ts
// queue.ts
import initQueue from '@core/queue';
import sendMail from './jobs/send-mail';
import processImage from './job/process-image';

const job = {
  'send-mail': sendMail,
  'process-image': processImage,
};

const redisCon = {
  host: '127.0.0.1',
  port: 6379,
  username: 'default',
  password: 'secretPwd'
};

export default function initQueue() {
  return initQueye({
    job,
    connection: redisCon,
  });
}
```

### Register Queue

After the initialization script is created, we need to have it registered
when the application started, because we will lost the jobs then application
restarted (crashed or corrupted...).

```ts
// index.ts (The entry point of the application)
import initQueue from './queue';
initQueue();
```

### Add Job to Queue

Add to add job to a queue, we need to get a queue and add a job to it.
The job, can be any kind of job, background job, periodic job. The following
example will add a job to ``process-image`` queue and name it as ``process-banner``.

```ts
import queuePool from './queue';

function processBanner() {
  const { getQueue } = queuePool();
  const queue = getQueue('process-image');
  const props = {
    width: 1200,
    height: 600,
    dpi: 72,
  };
  queue.add('process-banner', props);
}
```

### Job Handler

Job handler is a callback function that accepts two parameters, first one is
the value passed to it when the job is created/added, the second one is the
job information.

```ts
export default function processImage(props: any, job: any) {
  console.log({ props });
}
```

## Use Case

As this is a layer of the BullQM, so the use case can be any thing that BullMQ can
apply. BullMQ is a powerful and robust job queue library for Node.js built on top of Redis.
It facilitates asynchronous task processing, allowing you to offload long-running or
resource-intensive tasks from your main application thread. Here are several key use 
cases for BullMQ:   

### Background Job Processing:

**Image and Video Processing**: When users upload media, BullMQ can handle tasks like resizing, converting formats, applying watermarks, or generating thumbnails in the background without blocking the user.   

**Sending Emails and Notifications**: Instead of waiting for email servers or notification services, your application can enqueue these tasks for background delivery. This improves response times for users.   

**Data Processing and Analytics**: Tasks like batch data imports, complex calculations, report generation, and data synchronization can be processed in the background.   

**Webhooks**: Triggering and managing outgoing webhook calls to other services can be reliably handled using BullMQ, with retries and error handling.

### Scheduled Jobs (Cron-like Tasks):

**Database Backups**: Regularly schedule database backups to run at specific intervals (e.g., nightly).   

**Cleanup Tasks**: Automatically remove temporary files, expired data, or perform maintenance tasks on a recurring schedule.   

**Generating Periodic Reports**: Schedule the creation and distribution of daily, weekly, or monthly reports.

**Refreshing Data**: Periodically update cached data or refresh materialized views in your database.

### Rate Limiting and Throttling:

**Interacting with Third-Party APIs**: When consuming APIs with rate limits, BullMQ's built-in rate limiter ensures you don't exceed those limits and get blocked.

**Preventing Resource Overload**: For tasks that might put a heavy load on your system, you can use rate limiting to control the number of jobs processed within a specific time frame.   

### Handling Large Data:

**Processing Large Files**: Break down large files into smaller chunks and process each chunk as a separate job, allowing for parallel processing and better resource management.   

**Batch Operations**: Group multiple related operations into a single job for more efficient processing.

### Decoupling Services and Increasing Reliability:

**Microservices Communication**: BullMQ can act as a message queue between different microservices, ensuring reliable communication even if one service is temporarily unavailable.   

**Retrying Failed Operations**: BullMQ offers robust retry mechanisms with various backoff strategies to handle transient errors and ensure tasks eventually complete.   

### Priority Queuing:

**Handling Urgent Tasks**: Assign different priority levels to jobs, ensuring that critical tasks are processed before less important ones.   

### Workflow Management (with BullMQ Flows):

**Complex Multi-Step Processes**: Define complex workflows as a series of interconnected jobs, where the output of one job can trigger subsequent jobs. This is useful for tasks like order processing, content publishing, or user onboarding.   
In essence, BullMQ is valuable in any application where you need to perform tasks asynchronously, reliably, and at scale, improving performance, user experience, and system resilience.   
