import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'ui-button-default',
  secondary: 'ui-button-secondary',
  destructive: 'ui-button-destructive',
  outline: 'ui-button-outline',
  ghost: 'ui-button-ghost',
  link: 'ui-button-link',
};

const sizes = {
  default: 'ui-button-md',
  sm: 'ui-button-sm',
  lg: 'ui-button-lg',
  icon: 'ui-button-icon',
};

const Button = forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn('ui-button', variants[variant] || variants.default, sizes[size] || sizes.default, className)}
    {...props}
  />
));

Button.displayName = 'Button';

export { Button };
export default Button;