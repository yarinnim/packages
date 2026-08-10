import React from 'react';
import { useState, useEffect } from 'react';
// import { createElement as re } from 'react';
import { openModal, closeModal } from './action';
import type { ModalHook } from './type';

type ModalProps = {
  template?: React.FC<any>,
};

/*
const Wrapper = (bindedProps: any, props: any) => {
  const { component } = bindedProps;
  const { children } = props;
  const hasComponent = !!(component || false);
  if (!hasComponent) return null;
  return re('div', {}, children); 
};
*/

export default function useModal(props: ModalProps = {}): ModalHook {
  const { template } = props;
  const [component, setComponent] = useState(null);
  const bindedProps = { template, setComponent };

  useEffect(() => {
    const bodyStyle = (component || false) ? 'hidden' : 'unset';
    document.body.style.overflow = bodyStyle;

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [component]);

  const close = closeModal.bind(null, bindedProps);
  const open = openModal.bind(null, bindedProps);

  return { 
    close,
    open,
    isOpen: () => !!(component || false),
    component,
   //  Wrapper: Wrapper.bind(null, bindedProps),
  };
}
