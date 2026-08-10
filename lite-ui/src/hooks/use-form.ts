import { useState } from 'react';
import type { FetchProps, FetchState } from './type';

type UseFormHook = [
  FetchState,
  (form: HTMLFormElement) => Promise<any>
];

const getFormProps = (form: HTMLFormElement, hookProps: any = {}) => {
  const { action } = form;
  const { method: hookMethod = false } = hookProps;
  const formMethod = form.getAttribute('method');
  const info = { method: hookMethod || formMethod || 'GET',  action };
  return info;
};

const handleSubmit = (pProps: any, form: HTMLFormElement) => {
  if (pProps.isAwait) return Promise.reject('Form state is pending, please wait.');

  const { fetcher, setAwait, setState } = pProps;

  const { method, action } = getFormProps(form, pProps.hookProps);
  const props = method.toUpperCase() === 'GET' ? { query: form } : { body: form };
  const reqProps = { method, ...props };

  setAwait(() => true);
  setState(() => ({}));

  const url = pProps.url || action;

  return fetcher(url, reqProps)
    .then((response: any) => {
      setState({ response });
      return response;
    })
    .catch((error: any) => {
      setState({ error });
      throw error;
    })
    .finally(() => {
      setAwait(() => false);
    });
};

export default function createUseForm(pProps: FetchProps) {
  const { fetcher } = pProps;
  return (url: string|false = false, hookProps: any = {}): UseFormHook => {
    const [isAwait, setAwait] = useState(false);
    const [state, setState] = useState({});
    const formHandler = handleSubmit.bind(null, {
      url,
      fetcher,
      isAwait,
      setAwait,
      state,
      setState,
      hookProps,
    });
    return [{ ...state, isAwait }, formHandler];
  };
}
