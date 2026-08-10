import React, { useEffect, useContext, useRef } from 'react';
import useList from '../use-list';
import createUseForm from '../use-form';
import context, { ContextProvider } from './Context';

type UseResourceProps = {
  url: string;
  fetcher: CallableFunction;
};

type UseResourceHook = [
  {
    formRef: any;
    ContextProvider: any;
    response?: any;
    isAwait: boolean;
    error?: any;
  },
  {
    submitForm: (form: HTMLFormElement) => Promise<any>;
    renderItems: (component: React.ComponentType) => React.ReactElement;
    renderCreate: (comp: React.ComponentType) => React.ReactElement;
    gotoPage: (page: number) => any;
  }
];


const CreateItem = (props: any)  => {
  const { render: Component } = props;
  const { listAction } = useContext(context);
  return (<Component addItem={listAction.addItem} />);
};


const Items = (props: any) => {
  const { renderItem: CompItem } = props;
  const { items: pItems } = props;
  const [items, listAction] = useList(pItems);
  const { removeItem, updateItem } = listAction;
  const { setListAction } = useContext(context);

  useEffect(() => {
    setListAction(listAction);
  }, []);

  return (<>{
    items.map((item: any, index: number) => {
      return (<CompItem
        data={item} key={index}
        removeItem={() => removeItem('_id', item._id)}
        updateItem={(updatedItem: any) => updateItem('_id', item._id, updatedItem)} />);
    })
    }</>);
};

const createPageInput = (page: number) => {
  const input: HTMLInputElement = document.createElement('input');
  input.type = 'hidden';
  input.name = 'page';
  input.value = page.toString();
  return input;
};

const gotoPage = (bindedProps: any, pageNumber: number) => {
  const { formRef, submitForm } = bindedProps;
  const form: HTMLFormElement = formRef.current.cloneNode(true);
  form.appendChild(createPageInput(pageNumber));
  submitForm(form).then(() => true).catch(() => false);
};

export default function useResource(props: UseResourceProps): UseResourceHook {
  const { url, fetcher } = props;
  const useForm =  createUseForm({ fetcher });
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, submitForm] = useForm(url);
  const [tmpItems] = useList(formState?.response?.data || []); console.log({ tmpItems });


  useEffect(() => {
    console.log('Requesting form submit');
    formRef?.current?.requestSubmit();
  }, []);

  return [
    { 
      ...formState,
      formRef,
      ContextProvider,
    },
    {
      submitForm,
      gotoPage: gotoPage.bind(null, { formRef, submitForm }),
      renderItems: (render: any) => {
        return (<Items items={formState.response?.data || [] } renderItem={render} />);
      },
      renderCreate: (render: any) => {
        return (<CreateItem render={render} />);
      },
    },
  ];
}
