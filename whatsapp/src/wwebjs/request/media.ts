import type { Message } from 'whatsapp-web.js';
import type { RequestMessageMedia } from '../../type';

type MediaType = 'image' | 'video' | 'ptt' | 'document';
type ImageMedia = RequestMessageMedia & { size: [number, number] }
type VideoMedia = RequestMessageMedia & { size: [number, number] }
type DocumentMedia = RequestMessageMedia & { filename: string };
type PTTMedia = RequestMessageMedia;

type Media = ImageMedia | VideoMedia | DocumentMedia | PTTMedia;

const getMediaInfo = (media: any, props: any = {}) => ({
  filehash: media.filehash,
  mediaKey: media.mediaKey,
  mimeType: media.mimetype,
  fileSize: media.size,

  mediaGroupId: media.parentMsgKey?.id,
  ...props,
});

const getImageMedia = (media: any): ImageMedia => getMediaInfo(media, {
  size: [media.width, media.height],
});

const getVideoMedia = (media: any): VideoMedia => getMediaInfo(media, {
  size: [media.width, media.height],
});

const getPTTMedia = (media: any): PTTMedia => getMediaInfo(media);

const getDocumentMedia = (media: any): DocumentMedia => getMediaInfo(media, {
  filename: media.filename,
});

const mediaInfoHandler: Record<MediaType, CallableFunction> = {
  image: getImageMedia,
  video: getVideoMedia,
  ptt: getPTTMedia,
  document: getDocumentMedia,
};

export default function getMedia(message: Message): Media|undefined {
  const { hasMedia, _data: media, type } = message as any;
  if (!hasMedia) return undefined;

  const getMediaInf = mediaInfoHandler[type as MediaType];
  return getMediaInf(media);
}
