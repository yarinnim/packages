import type { ModalHook } from './type';

type CreateUseConfirmProps = {
  modalHook: ModalHook,
  component: any,
};

type Confirm = {
  cancel: CallableFunction,
  confirm: CallableFunction,
  attributes?: Record<string, any>,
  state?: Record<string, any>,
};

type ConfirmProps = {
  onCancel?: CallableFunction,
  onConfirm?: CallableFunction,
  attributes?: Record<string, any>,
  state?: Record<string, any>,
};

const revealConfirm = (bindProps: any, props: ConfirmProps = {}): void => {
  const { modalHook, component } = bindProps;
  const { attributes = {}, state = {} } = props;
  const confirmProps = {
    cancel: (evt: any) => {
      evt.preventDefault();
      console.log('Cancel is triggered', new Date());
      props.onCancel && props.onCancel();
    },

    confirm: (evt: any) => {
      evt.preventDefault();
      console.log('Confirm is triggered', new Date());
      props.onConfirm && props.onConfirm();
    },

    attributes,
    state,
    key: Math.random(),
  };

  modalHook.open({ 
    component: [component, confirmProps],
  });
};

export default function createUseConfirm(props: CreateUseConfirmProps): any {
  const { modalHook, component } = props;
  const state = {
    modalHook,
    component,
  };
  return revealConfirm.bind(null, state);
}
