import React from 'react';
import Base, { type BaseProps } from './Base';

type InputProps = BaseProps<React.ComponentProps<'input'>>;

export default function Input(props: InputProps) {
  return (<Base {...props} />);
};
