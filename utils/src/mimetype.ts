const mimetype = {
  image: {
    'image/jpeg': '.jpg',
    'image/pjpeg': '.jpg', // Older alias
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/tiff': '.tif',
    'image/bmp': '.bmp',
    'image/x-icon': '.ico',
    'image/vnd.adobe.photoshop': '.psd',
    'image/heif': '.heif',
    'image/heic': '.heic',
  },

  video: {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/mpeg': '.mpeg',
    'video/ogg': '.ogv',
    'video/3gpp': '.3gp',
    'video/x-flv': '.flv',
    'video/x-matroska': '.mkv',
  },
  audio: {
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.oga',
    'audio/flac': '.flac',
    'audio/aac': '.aac',
    'audio/x-m4a': '.m4a',
    'audio/amr': '.amr',
  },

  document: {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.oasis.opendocument.text': '.odt',
    'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  },

  text: {
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/json': '.json',
    'text/xml': '.xml',
    'text/csv': '.csv',
    'text/markdown': '.md',
    'text/x-python': '.py',
    'text/x-csrc': '.c',
    'text/x-c++src': '.cpp',
  },

  archive: {
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip', // Alias
    'application/gzip': '.gz',
    'application/x-tar': '.tar',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
  },

  binary: {
    'application/octet-stream': '.bin', // General binary data
    'application/x-sh': '.sh', // Shell script
    'application/vnd.android.package-archive': '.apk',
    'application/x-msdownload': '.exe',
  },
};

const allMimetype: Record<string, string> = { 
  ...mimetype.image, ...mimetype.video, ...mimetype.audio,
  ...mimetype.document, ...mimetype.text, ...mimetype.archive,
  ...mimetype.binary,
};

export function getFileExtension(mimetypeString: string): string|false {
  const found = allMimetype[mimetypeString] || false;
  return found;
}
