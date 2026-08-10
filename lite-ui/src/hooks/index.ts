import { useEffect } from 'react';

export { default as createAutoFetch } from './use-auto-fetch';
export { default as createUseForm } from './use-form';
export { default as createUseFetch } from './use-fetch';
export { default as useSearch } from './use-search';

export { default as useClipboard } from './use-clipboard';

export { default as useModal } from './use-modal';
export { default as createUseConfirm } from './use-modal/use-confirm';

export { default as useFullScreen } from './use-fullscreen';
export { default as useList } from './use-list';
export { default as useSelect } from './use-select';

export { default as useTimer } from './use-timer';
export { default as useImage } from './use-image';

export { default as useResource } from './use-resource';

export const useInterval = (callback: CallableFunction, interval: number) => {
  useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, []);
};

export const useTimeout = (callback: CallableFunction, timeout: number) => {
  useEffect(() => {
    const timer = setTimeout(callback, timeout);
    return () => clearTimeout(timer);
  }, []);
};

export type { OpenModalProps, ModalHook } from './use-modal/type';
