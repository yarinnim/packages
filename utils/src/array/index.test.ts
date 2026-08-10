import { zip, zipAll } from '../array';

describe('Array', () => {
  const keys = ['id', 'name', 'gender'];

  it('Zip two arrays into objct', () => {
    const values = [1, 'Dara HENG', 'male'];
    const expected = {
      id: 1,
      name: 'Dara HENG',
      gender: 'male',
    };
    expect(zip(keys, values)).toEqual(expected);
  });

  it('Zip all values with provided keys', () => {
    const values = [
      [1, 'Dara HENG', 'male'],
      [2, 'Vichet HONG', 'female'],
      [3, 'Sophea HUOT', 'female'],
    ];
    const expected = [
      { id: 1, name: 'Dara HENG', gender: 'male' },
      { id: 2, name: 'Vichet HONG', gender: 'female' },
      { id: 3, name: 'Sophea HUOT', gender: 'female' },
    ];
    expect(zipAll(keys, values)).toEqual(expected);
  });
});
