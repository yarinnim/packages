import {
  extract,
  removeFields,
  merge,
  renameFields,
  type JSObject,
} from './index';

const person: JSObject = {
  name: 'Dara',
  age: 12,
  gender: 'male',
  uuid: 1234567890,
};

describe('Object', () => {
  it('Extract an object into new object', () => {
    const newObject = extract(['name', 'age'], person);
    expect(newObject).toEqual({
      name: person.name,
      age: person.age,
    });
  });

  it('Removes some fields', () => {
    const newObj = removeFields(['name', 'age', 'uuid'], person);
    expect(newObj).toEqual({
      gender: person.gender,
    });
  });

  it('Merge two object into one, obmit the undefined members', () => {
    const name: string = 'Heng DARA';
    const id: number = 123;
    let age;
    const source: JSObject = { name, age };
    const result = merge(source, { id });
    expect(result).toEqual({ name, id });
  });

  it('Rename fields of object', () => {
    const toRename = {
      name: 'user.name',
      age: 'user.age',
      gender: 'sex',
      welcome: 'good',
    };
    const result = renameFields(toRename, person);
    expect(result).toEqual({
      'user.name': person.name,
      'user.age': person.age,
      sex: person.gender,
      uuid: person.uuid,
    });
  });
});
