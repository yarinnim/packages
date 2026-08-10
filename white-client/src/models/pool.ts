import { createModel } from '@core/db';
import { getConfig } from '../config';

export const initModel = (tableName: string) => {
  return () => {
    const config = getConfig();
    const { databasePool } = config;
    if (!databasePool) throw new Error('No database pool initialized for White Client...');
    return createModel(databasePool, tableName);
  };
};
