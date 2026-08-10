import type { DownloadProps } from './type';

const withFilename = (download: DownloadProps) => {
  if (download === true) return false;
  const { filename = false } = download as Record<string, string>;
  return filename;
};

const getFilename = (headers: Headers, download: DownloadProps): string => {
  const contentDisposition = headers.get('Content-Disposition') || '';
  const match = contentDisposition.match(/filename="([^"]+)"/) || false;
  const filename = (match && match[1]) || withFilename(download);
  if (!filename) throw new Error('Download filename is not defined.');
  return filename;
};

const getHeaderProps = (headers: Headers, download: DownloadProps) => {
  const filename = getFilename(headers, download);
  const contentType = headers.get('Content-Type');
  return { filename, contentType };
};

type TriggerDownload = {
  filename: string,
  content: Blob,
};

const triggerDownload = (props: TriggerDownload) => {
  const { content, filename  } = props;
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default function download(res: Response, download: DownloadProps) {
  const { headers } = res;
  return res.blob()
    .then((content: any) => {
      const { filename } = getHeaderProps(headers, download);
      return triggerDownload({ filename, content });
    });
}
