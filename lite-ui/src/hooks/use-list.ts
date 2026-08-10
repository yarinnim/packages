import { useState } from 'react';

type ListProps<T> = {
  items?: T[],
};

type ListResult<T> = [
  T[],
  any,
];

type State<T> = {
  items: T[],
  setItems: CallableFunction,
};

type TouchItem<T> = {
  fieldName: string,
  fieldValue: any,
  item?: T,
};

type ListAction = {
  setItems: CallableFunction,
  addItem: CallableFunction,
  updateItem: CallableFunction,
  removeItem: CallableFunction,
};

type ListHook<T> = [Array<T>, ListAction];

function removeItemHandler<T>(state: State<T>, itemProps: TouchItem<T>) {
  const { setItems, items } = state;
  const { fieldName, fieldValue } = itemProps;
  const remainingItems = items.filter((item: T) => {
    const { [fieldName]: itemValue = false } = item as any;
    return (itemValue !== fieldValue);
  });
  return setItems(() => remainingItems);
};

function updateItemHandler<T>(state: State<T>, itemProps: TouchItem<T>) {
  const { items, setItems } = state;
  const { fieldName, fieldValue, item } = itemProps;
  const touchedItems = items.map((pItem: T) => {
    const { [fieldName]: itemValue } = pItem as any;
    return itemValue === fieldValue ? item : pItem;
  });
  return setItems(() => touchedItems);
}

const touchItems = (items: any[]) => items.map((item: any, index: number) => {
  const data = { ...item, _id: index };
  return data;
});

export default function useList<T>(initItems: Array<T> = []): ListHook<T> {
  const [stateItems, setItems] = useState(initItems);
  const items = touchItems(stateItems);
  const state: State<T> = { items, setItems };

  return [
    items,
    {
      setItems,
      addItem: (item: T) => setItems((curItems: T[]) => ([
        ...curItems,
        { ...item, _id: curItems.length },
      ])),
      removeItem: function(fieldName: string, fieldValue: any) {
        const itemProps = { fieldName, fieldValue };
        return removeItemHandler<T>(state, itemProps);
      },
      updateItem: function(fieldName: string, fieldValue: any, item: T) {
        return updateItemHandler<T>(state, { fieldName, fieldValue, item });
      },
    },
  ] as ListResult<T>;
};
