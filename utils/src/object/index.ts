export type JSObject = Record<string, any>;

const isNull = (val: any) => val === undefined || val === null;

/**
 * Extracts fields into new object
 * @param {string[]} fields - Fields to be extracted
 * @param {object} obj - Object to be extracted
 * @return object - New extracted object
 */
export function extract(fields: string[], obj: any): Record<string, any> {
  return fields.reduce((accu: any, field: string) => {
    if (typeof field !== 'string') return accu;
    return { ...accu, [field]: obj[field] };
  }, {});
}

/**
 * Deletes fields from an object
 * @param {string[]} fields - Fields to be removed
 * @param {object} object
 * @return object - New object with removed fields
 */
export function removeFields(fields: string[], obj: any): Record<string, any> {
  const cloned = { ...obj };
  fields.forEach((field: string) => {
    delete cloned[field];
  });
  return cloned;
}

/**
 * Merge the source and destination but
 * it obmits the undefined key from the source object
 * @param {JSObject} source - The object to merge
 * @param {JSObject} dest - Destination object to be merged
 * @return JSObject
 */
export function merge(source: JSObject, dest: JSObject = {}): JSObject {
  const keys = Object.keys(source);
  return keys.reduce((carry: any, field: string) => {
    if (isNull(source[field])) return carry;
    return {
      ...carry,
      [field]: source[field],
    };
  }, dest);
}

/**
 * Rename the object fields with new binded fields
 * and returns effected object.
 * @param {JSObject} field - Object of field mapping
 * @param {JSObject} obj - Object to have its field names renamed.
 * @return JSObject
 */
export function renameFields(field: JSObject, obj: JSObject): JSObject {
  const names = Object.keys(field);
  const cloned = { ...obj };

  names.forEach((name: string) => {
    if (!isNull(cloned[name])) {
      const newName = field[name];
      cloned[newName] = cloned[name];
      delete cloned[name];
    }
  });

  return cloned;
}

export function logObject(obj: JSObject, wsChar: any = null, nSpace: number = 2) {
  const jsonString = JSON.stringify(obj, wsChar, nSpace);
  /* eslint-disable-next-line no-console */
  console.log(jsonString);
}
