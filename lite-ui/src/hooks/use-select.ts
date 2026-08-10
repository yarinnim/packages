import { useState } from 'react';

type SelectHookProps<T> = {
  selectedItem?: T,
  items:Array<T>,
};

type SelectHook<T> = {
  selectedItem: T,
  select: CallableFunction,
};

export default function useSelect(props: any): any {
  const { selectedItem: defSelectedItem, items = [] } = props;
  const [selectedItem, setSelectedItem] = useState(defSelectedItem);
  const touchedItems = items.map((item: any) => ({
    select: () => setSelectedItem(() => item),
    item: item,
  }));

  return {
    selectedItem,
    select: (item: any) => setSelectedItem(() => item),
    items: touchedItems,
  };
}
