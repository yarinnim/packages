import React from 'react';
import { createElement as re, Fragment } from 'react';
import type { OpenModalProps } from './type';

export type ModalStackEntry = {
  id: number,
  node: React.ReactNode,
};

type ModalStackState = {
  template?: React.FC<any>,
  setStack: React.Dispatch<React.SetStateAction<ModalStackEntry[]>>,
};

let modalEntryId = 0;

/**
 * Builds the next unique stack entry id.
 *
 * @example
 * nextModalEntryId();
 */
const nextModalEntryId = (): number => {
  modalEntryId += 1;
  return modalEntryId;
};

/**
 * Renders every open modal layer (bottom → top).
 *
 * @example
 * renderModalStack(entries);
 */
export const renderModalStack = (
  entries: ModalStackEntry[],
): React.ReactNode => {
  if (!entries.length) return null;
  return re(
    Fragment,
    null,
    ...entries.map((entry) => entry.node),
  );
};

/**
 * Removes the topmost modal from the stack.
 *
 * @example
 * closeModal(state);
 */
export const closeModal = (state: ModalStackState) => {
  const { setStack } = state;
  setStack((current) => {
    if (!current.length) return current;
    return current.slice(0, -1);
  });
};

/**
 * Clears every modal layer.
 *
 * @example
 * closeAllModals(state);
 */
export const closeAllModals = (state: ModalStackState) => {
  const { setStack } = state;
  setStack(() => []);
};

/**
 * Removes one modal layer by id (used when that dialog dismisses itself).
 *
 * @example
 * closeModalById(state, 3);
 */
const closeModalById = (state: ModalStackState, entryId: number) => {
  const { setStack } = state;
  setStack((current) => current.filter((entry) => entry.id !== entryId));
};

/**
 * Opens a modal layer on top of any existing ones.
 *
 * @example
 * openModal(state, { component: Confirm });
 */
export const openModal = (state: ModalStackState, props: OpenModalProps) => {
  const { template: overlay, setStack } = state;
  const { component, template, keepMounted = false, ...restProps } = props;
  const [Component, ComponentProps] = Array.isArray(component)
    ? component
    : [component, {}];
  const entryId = nextModalEntryId();
  const overlayComp = template || overlay;

  const close = () => closeModalById(state, entryId);

  const onClick = (evt: any) => {
    evt.preventDefault();
    const toClose = !keepMounted && (evt.target === evt.currentTarget);
    if (toClose) close();
  };

  const node = re(
    overlayComp as any,
    { ...restProps, close, onClick },
    re(Component as any, ComponentProps),
  );

  setStack((current) => [...current, { id: entryId, node }]);
};
