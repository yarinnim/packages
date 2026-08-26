
export const getMessage = (data: any, toString: boolean = false) => {
  const { message } = data;
  if (message instanceof Error) {
    const { message: errorMsg } = message;
    return errorMsg;
  }

  if (typeof message === 'string') return message;
  const msg = toString ? JSON.stringify(message) : message;
  return msg;
};

export function writeConsoleLog(severity: string, data: any): void {
  const { timestamp, message } = data;
  const logMessage = getMessage({ message }, true);
  if (severity === 'request-log') return;

  const resMessage = [
    `[${severity.toUpperCase()}]`,
    timestamp.toISOString(),
    '-',
    logMessage,
  ].join(' ');
  /* eslint-disable no-console */
  return console.log(resMessage);
}

