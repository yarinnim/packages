/* eslint-disable no-unused-vars */
export type OpenModalProps = {
  component: React.FC | [React.FC, any],
  template?: React.FC,
  keepMounted?: boolean,
};

export type ModalHook = {
  close: CallableFunction,
  /** Closes every stacked modal layer. */
  closeAll: CallableFunction,
  open: (props: OpenModalProps) => any,
  isOpen: CallableFunction,
  component: any,
};
