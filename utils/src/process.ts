/* eslint-disable no-console */
type ProcessProps = {
  onInterrupt?: CallableFunction,
  onTerminate?: CallableFunction,
  onException?: (_error: any) => void,
  onRejection?: (_error: any) => void,
};

export default function processHandler(callback: CallableFunction, props: ProcessProps = {}) {
  const { 
    onInterrupt = false,
    onTerminate = false,
    onException = false,
    onRejection = false,
  } = props;
  try {
    process.on('SIGINT', () => {
      onInterrupt && onInterrupt();
      console.log('[INFO] Received user interruption command.');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      onTerminate && onTerminate();
      console.log('[INFO] Terminated by unexpected behavior.');
      process.exit(0);
    });

    process.on('uncaughtException', (error: any) => {
      onException && onException(error);
      const { message } = error;
      console.error(`[ERROR] ${message}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (error: any) => {
      onRejection && onRejection(error);
      const { message } = error;
      console.error(`[ERROR] ${message}`);
      process.exit(1);
    });

    return callback();
  } catch (error: any) {
    const { message } = error;
    console.error(`[ERROR] ${message}`);
    process.exit(1);
  };
}
