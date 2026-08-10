/* eslint-disable no-console */
import crypto from 'crypto';
import { TelegramClient } from 'telegram';
import { NewMessage } from 'telegram/events';
import readline from 'readline';
import processHandler from '@core/utils/process';
import { StringSession } from 'telegram/sessions';
import type { TelegramProps, TelegramOptions, Handler } from './type';
import eventHandler from './event-handler';
import { connectionStorage, phoneCodeAttemptStorage } from './utils';

const getOptions = (options: any = {}) => ({
  connectionRetries: 5,
  timeout: 10000,
  testServers: false,
  ...options,
});

const handlePhoneCode = (phoneNumber: string, props: any): Promise<any> => {
  const { phoneCodeAttempt } = props;
  const remain = phoneCodeAttempt.get();
  if (remain <= 0) throw new Error('Max phoneCodeAttempt reached.');
  return new Promise((resolve) => {
    const msg: string = [
      '--------- AUTHENTICATION REQUIRED ---------',
      'To authenticate, you need to input Code just sent to your telegram message.',
      `Phone Number: ${phoneNumber}`,
      `Retries Remains: ${remain}`,
      '-------------------------------------------',
    ].join('\n');
    console.log(msg);
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = '[INPUT] Please Auth Code: ';
    return input.question(question, (code: string) => {
      input.close();
      resolve(code);
    }); 
  });
};

const md5SessionString = (sessionString: string): string => crypto
  .createHash('md5')
  .update(sessionString)
  .digest('hex')
  .toString();

const createSession = (privProps: any, onSessionCreate: CallableFunction) => {
  const { connection, client, phoneNumber, me, defaultSession = {} } = privProps;
  console.log('[INFO] TELEGRAM - Telegram cient is connected');
  connection.set(true);

  const sessionKey = client.session.save();

  (onSessionCreate || false) && onSessionCreate({ 
    ...defaultSession,
    sessionString: sessionKey,
    phoneNumber,
    accountId: parseInt(me.id, 10),
  });
  const message: string = [
    '--------------- SESSION KEY, SAVE IT ----------------',
    'Platform: TELEGRAM',
    `Phone Number: ${phoneNumber}`,
    sessionKey,
    '------------------------------------------------------',
  ].join('\n');
  console.log(message);
  return {
    ...defaultSession,
    phoneNumber,
    sessionKey: md5SessionString(sessionKey),
  };
};

const initClient = (privProps: any, props: any) => {
  const { client, connection, phoneCodeAttempt } = privProps;
  const { phoneNumber, password, handlers } = props;

  return client.start({
    phoneNumber: () => phoneNumber,
    password: () => password,
    phoneCode: () => handlePhoneCode(phoneNumber, { phoneCodeAttempt }),
    onError: (error: any) => {
      const { message } = error;
      phoneCodeAttempt.decrease();
      console.error(`\n[ERROR] ${phoneNumber} - ${message}`);
    },
  })
    .then(() => client.getMe())
    .then((me: any) => createSession({ ...privProps, phoneNumber, me }, props.onSessionCreate))
    .then((createdSession: any) => {
      const eventProps = {
        client,
        handlers,
        isConnected: connection.get(),
        session: createdSession,
      };
      console.log('[INFO] TELEGRAM - Registering event handler');
      client.addEventHandler(eventHandler.bind(null, eventProps), new NewMessage({}));
      return client;
    })
    .catch((error: any) => {
      const { message } = error;
      console.error(`[TELEGRAM] ERROR - ${message}`);
      return false;
    });
};

export const stop = (privProps: any) => {
  const { client, connection } = privProps;
  console.log('[INFO] TELEGRAM - Stopping Telegram client...');
  return client.disconnect()
    .then(() => {
      console.log('[INFO] TELEGRAM - Client is disconnected...');
      connection.set(false);
    })
    .catch((error: any) => {
      const { message } = error;
      console.log({ error });
      console.error(`[ERROR] ${message}`);
    });
};

export default function initTalegram(
  props: TelegramProps, 
  handler: Handler,
  pOptions: TelegramOptions = {},
): Promise<TelegramClient> {
  const { maxPhoneCodeAttempts = 3, onSessionCreate, ...restOptions } = pOptions;
  const { apiId, apiHash, phoneNumber, password, sessionString = '' } = props;
  const handlers = Array.isArray(handler) ? handler : [handler];
  const options = getOptions(restOptions);

  const connection = connectionStorage(false);
  const phoneCodeAttempt = phoneCodeAttemptStorage(maxPhoneCodeAttempts);

  const session = new StringSession(sessionString);
  const client = new TelegramClient(session, parseInt(apiId.toString(), 10), apiHash, options); 

  const { defaultSession = {} } = props;
  const privProps = {
    client,
    session,
    connection,
    phoneCodeAttempt,
    defaultSession,
  };

  return new Promise((resolve: any) => {
    processHandler(() => {
      initClient(
        privProps,
        { phoneNumber, password, handlers, onSessionCreate },
      ).then(() => resolve(client));
    }, {
      onInterrupt: stop.bind(null, privProps),
      onTerminate: stop.bind(null, privProps),
    });
  });
}

export { Api } from 'telegram';
export type { TelegramProps, TelegramOptions, Request, Response, NextFunction } from './type';
export type { TelegramClient } from 'telegram';
