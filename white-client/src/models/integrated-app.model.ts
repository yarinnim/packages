import { initModel } from './pool';

const TABLE = 'integrated_app';

const getTable = initModel(TABLE);

export const find = (uuid: string) => {
  const table = getTable();
  return table()
    .select(['id', 'uuid', 'secretKey'])
    .where({ uuid })
    .whereNull('deleted_at')
    .first()
    .catch(() => false);
};
