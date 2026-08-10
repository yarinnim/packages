import fs from 'fs';
import { MessageMedia } from 'whatsapp-web.js';
import type { Message, Client, MessageSendOptions } from 'whatsapp-web.js';
import type { URLMedia, Base64FileInfo, MessageSendFilePathOptions } from '../type';

const replyMessageWithFilePath = (message: Message, filePath: string, options: any) => {
  const media = MessageMedia.fromFilePath(filePath);
  return message.reply(media, undefined, options);
};

const replyMessageWithUrl = (message: Message, urlMedia: URLMedia, options: any = {}) => {
  const [url, urlOptions] = Array.isArray(urlMedia) ? urlMedia : [urlMedia, {}];
  return MessageMedia.fromUrl(url, urlOptions).then((media: MessageMedia) => {
    return message.reply(media, undefined, options);
  });
};

const sendMessage = (client: Client, chatId: string, content: any, options?: MessageSendOptions) => {
  return client.sendMessage(chatId, content, options);
};

const getChatId = (props: any) => props.message.from;

const reply = (props: any, content: any, options?: MessageSendOptions) => {
  const { client } = props;
  const chatId = getChatId(props);
  return client.sendMessage(chatId, content, options);
};

const replyWithFilePath = (props: any, filepath: string, pOptions: MessageSendFilePathOptions = {}) => {
  const { client } = props;
  const { onMediaCreated = false, ...options } = pOptions;
  const chatId = getChatId(props);
  const file = MessageMedia.fromFilePath(filepath);
  if (onMediaCreated) onMediaCreated(file);
  return client.sendMessage(chatId, file, options);
};

export const replyWithBase64 = (
  props: any,
  filePath: string,
  fileInfo: Base64FileInfo,
  options: MessageSendOptions = {},
) => {
  const { client } = props;
  const content = fs.readFileSync(filePath).toString('base64');
  const { mimetype, filename } = fileInfo;
  const media = new MessageMedia(mimetype, content, filename);
  const chatId = getChatId(props);
  return client.sendMessage(chatId, media, options);
};

const replyWithUrl = (props: any, urlMedia: URLMedia, options?: MessageSendOptions) => {
  const { client } = props;
  const [url, urlOptions] = Array.isArray(urlMedia)? urlMedia : [urlMedia, {}];
  return MessageMedia.fromUrl(url, urlOptions).then((media: MessageMedia)  => {
    const chatId = getChatId(props);
    return client.sendMessage(chatId, media, options);
  });
};

const replyFromMessageId = (props: any, messageId: string) => {
  const { client }: { client: Client }= props;
  const chatId = getChatId(props);
  return client.getMessageById(messageId)
    .then((message: Message) => message.forward(chatId));
};

export default function initResponse(props: any, message: Message) {
  const { client } = props;
  const bindedProps = { client, message };
  return {
    replyMessage: (content: any, options: any) => message.reply(content, undefined, options),
    replyMessageWithFilePath: replyMessageWithFilePath.bind(null, message),
    replyMessageWithUrl: replyMessageWithUrl.bind(null, message),

    sendMessage: sendMessage.bind(null, client),

    reply: reply.bind(null, bindedProps),
    replyWithFilePath: replyWithFilePath.bind(null, bindedProps),
    replyWithBase64: replyWithBase64.bind(null, bindedProps),
    replyWithUrl: replyWithUrl.bind(null, bindedProps),
    replyFromMessageId: replyFromMessageId.bind(null, bindedProps),
  };
}
