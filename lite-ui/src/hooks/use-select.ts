import { useState } from 'react';

type SelectHookProps<T> = {
  selectedItem?: T,
  items: Array<T>,
};

type SelectHook<T> = {
  selectedItem: T|undefined,
  select: CallableFunction,
  items: T[],
};

export default function useSelect<T>(props: SelectHookProps<T>): SelectHook<T> {
  const { selectedItem: defSelectedItem, items = [] } = props;
  const [selectedItem, setSelectedItem] = useState(defSelectedItem);
  const touchedItems = items.map((item: any) => ({
    select: () => setSelectedItem(() => item),
    item: item,
  })) as Array<T>;

  return {
    selectedItem,
    select: (item: any) => setSelectedItem(() => item),
    items: touchedItems,
  };
}
