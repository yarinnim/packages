export type Theme = 'default' | 'primary' |
  'secondary' | 'error' | 'warning' |
  'info' | 'success' | 'link';

export type Size = 'small' | 'normal' | 'large';

export type Props = {
  theme?: Theme,
  size?: Size,
  isAwait?: boolean,
};

export type ElementProps = React.ReactElement
  | [React.ReactElement]
  | [React.ReactElement, Record<string, any>];

export type Justify = 'left' | 'center' | 'right';
