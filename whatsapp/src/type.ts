/* eslint-disable no-unused-vars */
import type { MediaFromURLOptions, MessageSendOptions, MessageMedia } from 'whatsapp-web.js';

type AuthProps = {
  //   clientId: string,
  dataPath?: string,
  rmMaxRetries?: number,
  backupSyncIntervalMs?: number,
};

export type WhatsAppOptions = {
  authProps?: AuthProps,
  qrMaxRetries?: number,

  onReady?: CallableFunction,
  onAuthenticated?: CallableFunction,
  onQR?: CallableFunction,
  onAuthFailure?: CallableFunction,
  onDisconnected?: CallableFunction,

  defaultSession?: Record<string, any>,
  puppeteer?: any,
};

export type URLMedia = [
  string,
  MediaFromURLOptions,
];

export type RequestChat = { id: string, name: string, isGroup: boolean };

export type RequestMessageMedia = {
  filehash: string,
  mediaKey: string,
  mimeType: string,
  size: number,
  fileSize: number,

  mediaGroupId?: string|undefined,
  associationType?: string,
};

type RequestMessage = Record<string, any> & {
  media: RequestMessageMedia,
};

export type PlainRequest = {
  session: any,
  senderId: any,
  chat: RequestChat,
  context?: any,
};

export type Request = PlainRequest & {
  message: RequestMessage,
  getMessages: CallableFunction,

  downloadMedia: CallableFunction,
  getMedia: CallableFunction,
};

export type BatchRequest = PlainRequest & {
  isPartial: boolean,
  messages: RequestMessage[],
};

export type Base64FileInfo = {
  mimetype: string,
  filename: string,
};

export type MessageSendFilePathOptions = {
  onMediaCreated?: (media: MessageMedia) => any,
} & MessageSendOptions;

export type Response = {
  sendMessage: (chatId: any, content: any, options?: any) => any,

  replyMessage: (content: any, option?: any) => any,
  replyMessageWithMedia: (mediaPath: string, options?: any) => any,
  replyMessageWithUrl: (url: string | URLMedia, options?: any) => any,

  reply: (content: any, options?: any) => any,
  replyWithFilePath: (filepath: string, option?: MessageSendFilePathOptions) => any,
  replyWithBase64: (
    filepath: string,
    fileInfo: Base64FileInfo,
    options?: MessageSendOptions,
  ) => any,
  replyWithFileUrl: (fileUrl: any, options?: any) => any,
  replyFromMessageId: (messageId: number|string) => any,
};

export type NextFunction = CallableFunction;
