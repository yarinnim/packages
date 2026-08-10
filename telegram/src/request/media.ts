type MediaType = 'photo' | 'document' | 'spoiler' | 'video' | 'round' | 'voice';

const getMediaType = (media: any): MediaType => {
  const { photo } = media;
  if (photo || false) return 'photo';
  return 'document';
};

const getBaseInfo = (medium: any, props: any) => ({
  id: parseInt(medium.id, 10),
  accessHash: parseInt(medium.accessHash, 10),
  mimeType: medium.mimeType,
  ...props,
});

const getPhotoInfo = (medium: any) => {
  const { sizes }= medium;
  const size = sizes[sizes.length - 1];

  return getBaseInfo(medium, {
    type: 'photo',
    mimeType: 'image/jpeg',
    size: [size.w, size.h],
    fileSize: size.sizes[size.sizes.length - 1],
  });
};

const getVoiceInfo = (medium: any) => getBaseInfo(medium, {
  type: 'voice',
  fileSize: parseInt(medium.size, 10),
  duration: medium.attributes[0].duration,
});

const getVideoInfo = (medium: any) => {
  const [attr, fileInfo = {}] = medium.attributes;
  return getBaseInfo(medium, {
    type: 'video',
    duration: attr.duration,
    size: [attr.w, attr.h],
    filename: fileInfo?.fileName,
    fileSize: parseInt(medium.size, 10),
  });
};

const getDocumentInfo = (medium: any) => {
  const [fileInfo, extraInfo] = medium.attributes;
  return getBaseInfo(medium, {
    fileSize: parseInt(medium.size, 10),
    filename: { ...fileInfo, ...extraInfo }.fileName,
  });
};

export default function getMedia(message: any) {
  const { media } = message;
  if (!(media || false)) return undefined;

  const type = getMediaType(media);
  const mediaInfo = media[type];

  if (type === 'photo') return getPhotoInfo(mediaInfo);

  const { video, voice } = media;
  if (voice) return getVoiceInfo(mediaInfo);
  if (video) return getVideoInfo(mediaInfo);
  return getDocumentInfo(mediaInfo);
}
