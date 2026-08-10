import React from 'react';
import Base, { type BaseProps } from './Base';

type ButtonProps = BaseProps<React.ComponentProps<'button'>>;

export default function Button(props: ButtonProps) {
  return (<Base {...props} Dom='button' />);
}
