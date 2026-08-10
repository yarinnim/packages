import { Props, Justify } from '../type';
import Icon from '../data-display/Icon';

export type BaseProps<T> = Props & {
  Dom?: string,
  icon?: any,
  rightIcon?: any,
  justify?: Justify,
} & T;

const getProps = (props: any = {}): any => {
  const { disabled, isAwait, className = '', ...rest} = props;
  return {
    ...rest,
    disabled: isAwait || disabled || false,
    className: `ui-input ${className}`,
  };
};


const getChildren = (props: any) => {
  const { children = null } = props;
  if (!(children || false)) return null;
  return (<div className="ui-content">{children}</div>);
}

const getIcon = (icon: any): any => {
  return Array.isArray(icon) ? icon : [icon, {}];
}

export default function Base<T>(props: BaseProps<T>) {
  const { isAwait = false, Dom = 'input' } = props;
  const { icon = null, rightIcon = null } = props;
  const baseProps = getProps(props);
  const [iconComp, iconProps] = getIcon(icon);
  if (Dom === 'button') {
    return (<button className="ui-input" {...baseProps}>
      <Icon isAwait={isAwait} {...iconProps}>{iconComp}</Icon>
      {getChildren(props)}
      {isAwait || (<Icon>{rightIcon}</Icon>)}
    </button>);
  }

  const { className, icon: _icon, ...inputProps } = baseProps;
  return (
    <div className={className}>
    <Icon isAwait={isAwait} {...iconProps}>{iconComp}</Icon>
      <Dom {...inputProps} />
    {isAwait || (<Icon>{rightIcon}</Icon>)}
  </div>);
}
