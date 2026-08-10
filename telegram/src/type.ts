/* eslint-disable no-unused-vars */

export type TelegramOptions = {
  connectionRetries?: number,
  timeout?: number,
  testServers?: boolean,

  maxPhoneCodeAttempts?: number,
  onSessionCreate?: CallableFunction, 
};

type Chat = {
  id: number|string,
  type: string,
};

type Message = {
  message: string,
  id: number,
  peerId: any,
  media?: any,
  groupedId?: number,
}

export type Request = {
  chat:  Chat,
  message: Message,
  senderId: number | string,
  session: any,
  context?: any,

  getMessages: () => Promise<any>,
};

export type BatchRequest = Omit<Request, 'getMessages' | 'message' | 'downloadMedia'> & {
  messages: Message[],
};

export type Response = {
  send: (chatId: string, message: string, options?: any) => Promise<any>,
  sendFile: (chatId: string, file: any, options?: any) => Promise<any>,
  reply: (message: string, options?: any) => Promise<any>,
  replyWithFile: (file: any, options?: any) => Promise<any>,

  getChatId: () => Promise<any>,
  forwardMessage: (destination: string|number, props: any) => Promise<any>,
  forwardTo: any,
}

export type NextFunction = () => any;

/* eslint-disable no-unused-vars */
type ActionHandler = (
  request: Request,
  response: Response,
  next?: NextFunction
) => Promise<any>;

export type Handler = any; // ActionHandler | ActionHandler[];

export type TelegramProps = {
  apiId: number,
  apiHash: string,
  phoneNumber: string,
  password?: string,
  sessionString?: string,
  defaultSession?: Record<string, any>,
};

