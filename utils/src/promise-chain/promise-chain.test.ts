import chain from './promise-chain';

const getA = (age: Number) => ({
  name: 'Dara',
  gender: 'Male',
  age,
});

const getB = (user: any) => {
  const { age } = user;
  const newAge = age * 2;
  if (newAge >= 18) return ({ ...user, age: newAge });
  throw new Error('Too low');
};

const spread = (name: string, gender: string, age: number) => ({
  name,
  gender,
  age,
});

const expected = { name: 'Dara', gender: 'Male', age: 20 };

const test = () => false;

const actions = [
  test,
  [getA, 18],
  [getB, (user: any) => ({ ...user, age: 10 })],
  [spread, (user: any) => {
    const { name, gender, age } = user;
    return [name, gender, age];
  }],
] as any;

describe('Testing the callback hell chain', () => {
  it('Runs the chain callback', () => chain(actions)
    .then((result: any) => expect(result).toEqual(expected)));
});
