/**
 * Zips an array of keys with an array of vules
 * @param {string[]} keys - Array of keys
 * @param {any[]} values - Array of values
 * @return Record<string, any>
 */
export const zip = (keys: string[], values: any[]): Record<string, any> => keys
  .reduce((accu: any, key: string, index: number) => ({
    ...accu,
    [key]: values[index],
  }), {});

/**
 * Zips all arrays items with a key into an
 * array of object
 * @param {string[]} keys - Array of keys
 * @param {any[]} allItems - Array of array of values
 * @return Array<Record<string, any>>
 */
export const zipAll = (keys: string[], allItems: any[]): any[] => allItems
  .map((values: any[]) => zip(keys, values));
