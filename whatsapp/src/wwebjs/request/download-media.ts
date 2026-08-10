import path from 'path';
import type { Message } from 'whatsapp-web.js';
import { Readable } from 'stream';
import { createWriteStream, mkdirSync } from 'fs';

type SaveOptions = {
  outPath: string,
  filename: string,
};

type SaveResult = {
  dirname: string,
  filename: string,
  filePath: string,
};

const getFilename = (media:any, options: SaveOptions): SaveResult => {
  const { filename = false, outPath } = options;
  const { filename: mediaFilename } = media;
  const fn = mediaFilename || filename;
  const filePath = `${outPath}/${fn}`;
  const dirname = path.dirname(filePath);
  mkdirSync(dirname, { recursive: true });
  return {
    filename: fn,
    dirname,
    filePath,
  };
};

export const saveMedia = (media: any, options: SaveOptions) => {
  const buffer = Buffer.from(media.data, 'base64');
  const readable = new Readable();

  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);

  const fileInfo = getFilename(media, options);
  const writeStream = createWriteStream(fileInfo.filePath);
  return new Promise((resolve, reject) => {
    readable.pipe(writeStream);
    writeStream.on('finish', () => resolve(fileInfo));
    writeStream.on('error', (error: any) => reject(error));
  });

};

export function downloadMedia(message: Message, options: SaveOptions) {
  const { hasMedia } = message;
  if (!(hasMedia)) return Promise.reject(new Error('Message does not have media'));
  return message.downloadMedia()
    .then((media: any) => saveMedia(media, options));
}

export function getMedia(message: Message) {
  const { hasMedia } = message;
  if (!hasMedia) return Promise.reject(new Error('Message does not have media.'));
  return message.downloadMedia();
}

