/* eslint-disable no-bitwise */
import fs from 'fs';
import { spawn } from 'child_process';

type Compress = {
  password?: string;
  removeSourceFile?: boolean;
};

function checkFile(filePath: string) {
  return new Promise((resolve, reject) => {
    const mode = fs.constants.F_OK | fs.constants.W_OK;
    fs.access(filePath, mode, (error) => {
      if (error) reject(error);
      resolve(true);
    });
  });
}

function touchKey(key: string, value: any): string[] {
  if (key === 'chunkPaths' && value) return ['-j'];
  if (key === 'password') return ['-P', value];
  return [];
}

function propsToParams(pProps: any): string[] {
  const props = { chunkPaths: true, ...pProps };
  const keys = Object.keys(props);
  return keys.reduce((carry: string[], key: string) => {
    const item = touchKey(key, props[key]);
    return [...carry, ...item];
  }, []);
}

function cleanSourceFile(filePath: string, clean = false): boolean | any {
  if (!clean) return true;
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error: any) {
    return error;
  }
}

export function compressFile(filePath: string, toFile: string, props: Compress = {}): string | any {
  return checkFile(filePath)
    .then(() => {
      const params = propsToParams(props);
      return [...params, toFile, filePath];
    })
    .then((params: string[]) => {
      const proc = spawn('zip', params);
      return new Promise((resolve, reject) => {
        proc.on('exit', (error) => {
          if (error) reject(error);
          const { removeSourceFile } = props;
          const cleaned = cleanSourceFile(filePath, removeSourceFile);
          if (cleaned) resolve(toFile);
          else reject(cleaned);
        });
      });
    });
}

export function decompressFile(filePath: string) {
  return filePath;
}
