import type { TelegramClient } from 'telegram';

type BindedProps = {
  client: TelegramClient,
  event: any,
};

const send = (bindedProps: any, chatId: any, message: string, props: any = {}) => {
  const { client } = bindedProps;
  return client.sendMessage(chatId, {
    ...props,
    message,
  });
};

const sendFile = (bindedProps: any, chatId: any, file: any, props: any = {}) => {
  const { client } = bindedProps;
  return client.sendFile(chatId, {
    ...props,
    file,
  });
};

const getChatId = (event: any) => {
  const { message } = event;
  return message.getSender();
};

const reply = (bindedProps: any, message: string, props: any = {}) => {
  const { event } = bindedProps;
  return getChatId(event)
    .then((replyTo: any) => send(bindedProps, replyTo, message, props));
};

const replyWithFile = (bindedProps: any, file: any, props: any = {}) => {
  const { event } = bindedProps;
  return getChatId(event)
    .then((chatId: any) => sendFile(bindedProps, chatId, file, props));
};

const forwardMessage = (bindedProps: BindedProps, destinationChat: string, props: any) => {
  const { messages, ...restProps } = props;
  const { event, client } = bindedProps;

  return getChatId(event)
    .then((chatId: any) => client.forwardMessages(destinationChat, {
      messages,
      fromPeer: chatId.id,

      silent: false,
      dropAuthor: true,
      ...restProps,
    }));
};

const forwardTo = (bindedProps: any, destination: string, options: any = {}) => {
  const { event } = bindedProps;
  console.log({ options });
  return event.message.forwardTo(destination, options);
};

export default function initResponse(client: TelegramClient, event: any) {
  const bindedProps = { client, event };

  return {
    getChatId: () => event.message.getSender(),
    send: send.bind(null, bindedProps), 
    sendFile: sendFile.bind(null, bindedProps),
    reply: reply.bind(null, bindedProps),
    replyWithFile: replyWithFile.bind(null, bindedProps),

    forwardMessage: forwardMessage.bind(null, bindedProps),

    forwardTo: forwardTo.bind(null, bindedProps),
  };
}
