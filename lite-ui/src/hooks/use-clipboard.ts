import { useState, useEffect, useCallback } from 'react';

type UseClipboardProps = {
  content?: string | any;
};

export default function useClipboard(props: UseClipboardProps = {}) {
  const { content } = props;
  const [isAwait, setAwait] = useState(false);

  const handleCopy = (text: any = ''): any => {
    if (!navigator.clipboard) {
      return new Promise((resolve) => resolve(false));
    }

    const value = text || content || '';

    return navigator
      .clipboard
      .writeText(value)
      .finally(() => setAwait(true));
  };

  useEffect(() => {
    let timer: any;
    if (isAwait) timer = setTimeout(() => setAwait(false), 1500);
    return () => clearTimeout(timer);
  }, [isAwait]);

  return [isAwait, handleCopy] as [boolean, any];
}
