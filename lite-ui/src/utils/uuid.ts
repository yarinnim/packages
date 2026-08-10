export function generateUUIDv4():string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(charItem: string) {
    const randomVal = Math.random() * 16 | 0;
    const value = charItem === 'x' ? randomVal : (randomVal & 0x3 | 0x8);
    return value.toString(16);
  });
}

export const test = '';
