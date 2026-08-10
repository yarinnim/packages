import fs from 'fs';
import path from 'path';
import getMedia from './media';

type DownloadOptions = {
  outPath: string,
  filename?: string,
  onProgress?: (_downloadedSize: number, _totalSize: number) => void,
};

const createFolder = (outFile: string) => {
  const dirname = path.dirname(outFile);
  fs.mkdirSync(dirname, { recursive: true });
  return dirname;
};
    
type OutputFile = {
  filename: string,
  dirname: string,
  filePath: string,
};

const getOutputFile = (media: any, props: any): OutputFile => {
  const { filename = false } = media;
  const { outPath, filename: preFilename } = props;

  const fn = preFilename || filename;
  const filePath =  `${outPath}/${fn}`;
  const dirname = createFolder(filePath);
  return {
    filename: fn,
    dirname,
    filePath,
  };
};

export default function downloadMedia(
  client: any,
  chatId: string,
  messageId: string,
  options: DownloadOptions,
): Promise<OutputFile> {
  const { onProgress = undefined } = options;

  return client.getEntity(chatId)
    .then((peerId: any) => client.getMessages(peerId, { ids: [parseInt(messageId, 10)] }))
    .then(([message]: any[]) => message)
    .then((message: any) => {
      const media = getMedia(message);
      const outputFile = getOutputFile(media, options);
      const downloadOptions = {
        outputFile: outputFile.filePath,
        file: 'download_attachment',
        workers: 1,
        progressCallback: onProgress,
      };
      return client.downloadMedia(message.media, downloadOptions)
        .then(() => outputFile);
    });
}
