import { createWriteStream } from 'fs';
import { checkFile, waitFileClosed } from './common';
import writeCSV from './csv';

type Export = {
  format?: string;
  delimiter?: string;
}

export default function writeToFile(data: any[], toFile: string, props: Export = {}) {
  const { format = 'csv', delimiter = ',' } = props;
  return checkFile(toFile)
    .then((fileStatus: any) => {
      const { valid, error } = fileStatus;
      if (!valid) throw error;
      return createWriteStream(toFile);
    }).then((writeStream: any) => {
      const writer = { csv: writeCSV }[format] || false;
      if (!writer) throw new Error(`Cannot allocation ${format} writer...`);
      writer(writeStream, data, { delimiter });
      writeStream.end();
      writeStream.close();
      return waitFileClosed(writeStream);
    });
}
