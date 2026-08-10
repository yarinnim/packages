import React from 'react';
import { Props } from '../type';
import { SpinningIcon } from '../Icons';

type IconProps = {
} & Props & React.ComponentProps<'div'>;

export default function Icon(props: IconProps) {
  const {
    className = '',
    style = {},
    isAwait = false,
    children = false,
  } = props;

  const css = `ui-icon ${className}`;

  if (isAwait) return <div className={`${css} animate-spin`} style={style}><SpinningIcon /></div>;
  if (!children) return (<></>);
  return (<div className={css} style={style}>{children}</div>);
}
