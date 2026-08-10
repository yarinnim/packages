/* eslint-disable no-console */
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import type { WhatsAppOptions, Request } from '../type';
import initSession from './session';
import initRequest from './request';
import initResponse from './response';
import initPipeline from '../pipline-executor';

const generateQRCode = (qrString: string, props: any) => {
  const { exists, session } = props;
  const msg = [
    exists ? `[INFO] WhatsApp-${session.id} - Re-generating QRCode for existing session.` : '',
    `QR Code for: ${session.id}`,
    'Use your WhatsApp mobile app to scan the QR Code.',
  ].join('\n');
  console.log(msg);
  qrcode.generate(qrString, { small: true });
};

const onQR = (config: any, qrString: string) => {
  const { session } = config;
  const { exists } = session.getState();

  generateQRCode(qrString, { session, exists });
};

const onAuthenticated = (config: any) => {
  const { session } = config;
  const message = `[INFO] WhatsApp-${session.id} - Account is authenticated.`;
  console.log(message);
  session.setState('authenticated', true);
  session.save(session.id);
};

const onReady = (config: any) => {
  const { session, onReady: onReadyHandler, client } =  config;
  session.lastActivity = new Date().getTime();
  session.setState('isReady', true);
  const msg = `[INFO] WhatsApp-${session.id} - Account is ready to handle the message.`;
  console.log(msg);
  (onReadyHandler || false) && onReadyHandler({ client, session });
};

const onAuthFailure = (config: any, reason: any) => {
  const { session } = config;
  session.resetState();
  const msg = `[ERROR] WhatsApp-${session.id} - Auth failed cause by ${reason}.`;
  console.log(msg);
};

const onDisconnected = (config: any, reason: any) => {
  const { session, client } = config;
  session.setState('isReady', false);
  session.lastActivity = new Date().getTime();
  const message = `[ERROR] WhatsApp-${session.id} - Connection disconnected caused by ${reason}.`;
  console.log(message);

  if (reason !== 'NAVIGATION') return true;

  const timer = setTimeout(() => {
    const retryMsg = `[INFO] WhatsApp-${session.id} - Trying to initialize WhatsApp Client.`;
    console.log(retryMsg);
    clearTimeout(timer);
    client.initialize();
  }, 3000);
  return timer;
};

const onStateChanged = (config: any, state: any) => {
  const { session } = config;
  const msg = `[INFO] WhatsApp-${session.id} - State changed to ${state}.`;
  console.log(msg);
  if (state !== 'CONFLICT') return false;
  const conflictMsg = [
    `[WARNING] WhatsApp-${session.id}`,
    'Multiple session dectected, closing others.',
  ].join(' - ');
  console.log(conflictMsg);
  return true;
};

const onMessageHandler = (config: any, message: Message) => {
  if (message.fromMe) return message;
  const { onMessage, ...restProps  } = config;
  return initRequest(restProps, message).then((request: Request|undefined) => {
    if (request === undefined) return request;
    const response = initResponse(restProps, message);
    const executePipeline = initPipeline(onMessage);
    return executePipeline(request, response);
  });
};

const getAuthProps = (sessionId: string, authProps: any) => ({
  // dataPath: './.wwebjs_auth',
  backupSyncIntervalMs: 300000,
  ...authProps,
  clientId: sessionId,
});

const puppeteer = {
  headless: true,
  timeout: 60000,
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', 
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--max-old-space-size=4096',
  ],
};

const getPuppeteer = (props: any) => ({
  ...puppeteer,
  ...props,
});

export default function initClient(
  sessionId: string|number,
  onMessage: any,
  options: WhatsAppOptions = {},
) {
  const { authProps, qrMaxRetries = 0, defaultSession = {}, puppeteer: pPuppeteer = {} } = options;
  const authStrategy = new LocalAuth(getAuthProps(sessionId as string, authProps));
  const puppeteer = getPuppeteer(pPuppeteer);
  const client = new Client({ puppeteer, qrMaxRetries, authStrategy });
  const session = initSession(sessionId, { ...authStrategy });
  const privProps = { client, session };

  client.initialize();

  client.on('qr', onQR.bind(null, { ...privProps, onQR: options.onQR }));
  client.on('authenticated', onAuthenticated.bind(null, { 
    ...privProps,
    onAuthenticated: options.onAuthenticated,
  }));
  client.on('ready', onReady.bind(null, { ...privProps, onReady: options.onReady }));
  client.on('message', onMessageHandler.bind(null, { ...privProps, onMessage, defaultSession }));
  client.on('auth_failure', onAuthFailure.bind(null, {
    ...privProps,
    onAuthFailure: options.onAuthFailure,
  }));
  client.on('disconnected', onDisconnected.bind(null, {
    ...privProps, 
    onDisconnected: options.onDisconnected,
  }));
  client.on('change_state', onStateChanged.bind(null, privProps));

  session.validate();

  return client;
}
