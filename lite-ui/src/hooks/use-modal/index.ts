import React from 'react';
import { useState, useEffect } from 'react';
import {
  openModal,
  closeModal,
  closeAllModals,
  renderModalStack,
  type ModalStackEntry,
} from './action';
import type { ModalHook } from './type';

type ModalProps = {
  template?: React.FC<any>,
};

/**
 * Modal host with a stack so layered dialogs keep their own backdrops.
 *
 * @example
 * const modal = useModal({ template: Modal });
 * modal.open({ component: Confirm });
 */
export default function useModal(props: ModalProps = {}): ModalHook {
  const { template } = props;
  const [stack, setStack] = useState<ModalStackEntry[]>([]);
  const bindedProps = { template, setStack };

  useEffect(() => {
    const bodyStyle = stack.length > 0 ? 'hidden' : 'unset';
    document.body.style.overflow = bodyStyle;

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [stack.length]);

  useEffect(() => {
    if (!stack.length) return undefined;
    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key !== 'Escape') return;
      evt.stopPropagation();
      closeModal(bindedProps);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [stack.length]);

  const close = closeModal.bind(null, bindedProps);
  const closeAll = closeAllModals.bind(null, bindedProps);
  const open = openModal.bind(null, bindedProps);

  return {
    close,
    closeAll,
    open,
    isOpen: () => stack.length > 0,
    component: renderModalStack(stack),
  };
}
