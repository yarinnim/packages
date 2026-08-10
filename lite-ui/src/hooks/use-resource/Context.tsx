import { createContext, useState } from 'react';

const Context = createContext({} as any);

export function ContextProvider(props: any) {
  const { children } = props;
  const [listAction, setListAction] = useState({});

  const value = {
    listAction,
    setListAction,
  };

  return (<Context value={value}>{children}</Context>);
};

export default Context;
