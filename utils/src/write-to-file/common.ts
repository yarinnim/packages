/* eslint-disable no-bitwise */
import fs from 'fs';

/**
 * Wait for the file status until it's valid
 * @param {Writer} writer - The writer stream to validate
 */
export function waitFileClosed(writer: any) {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const { closed } = writer;
      if (closed) {
        clearInterval(timer);
        resolve(true);
      }
    }, 10);
  });
}

/**
 * Checks the filePath is valid for operation
 * @param {string} filePath - Path to the file to be operated
 * @return Promise<boolean>
 */
export function checkFile(filePath: string): Promise<any> {
  return new Promise((resolve) => {
    const mode = fs.constants.F_OK | fs.constants.W_OK;
    fs.access(filePath, mode, (error) => resolve({
      valid: !!error,
      error,
    }));
  });
}
