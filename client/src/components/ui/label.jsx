import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Label = forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('ui-label', className)} {...props} />
));

Label.displayName = 'Label';

export { Label };
export default Label;