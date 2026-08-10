import React from 'react';
import { createElement as re, useEffect } from 'react';
import type { OpenModalProps } from './type';

const handleEscape = (state: any, evt: any) => {
  if (evt.key === 'Escape') closeModal(state);
};

const WrapperComp = (props: any) => {
  const { children, state } = props;
  const event = handleEscape.bind(null, state);
  useEffect(() => {
    document.addEventListener('keydown', event);
    return () => {
      document.removeEventListener('keydown', event);
    };
  });
  return children;
};

const touchProps = (setComponent: CallableFunction, props: any = {}) => ({
  ...props,
  close: () => setComponent(() => null),
});

export const openModal = (state: any, props: OpenModalProps): any => {
  const { template: overlay, setComponent } = state; 
  const { component, template, keepMounted = false, ...restProps } = props;

  const [Component, ComponentProps] = Array.isArray(component) ? component : [component, {}];

  const onClick = (evt: any) => {
    evt.preventDefault();
    const toClose = !keepMounted && (evt.target === evt.currentTarget);
    if (toClose)  closeModal(state);
  };

  const overlayComp = template || overlay;
  setComponent(() => {
    const touchedProps = touchProps(setComponent, restProps);
    return re(WrapperComp, { state }, 
      re(
        overlayComp,
        { ...touchedProps, onClick  },
        re(Component, ComponentProps),
      ),
    );
  });
};

export const closeModal = (state: any) => {
  const { setComponent } = state;
  setComponent(() => null);
};

