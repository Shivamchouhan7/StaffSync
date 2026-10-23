import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(({ className, ...props }, ref) => (
  <select ref={ref} className={cn('ui-select', className)} {...props} />
));

Select.displayName = 'Select';

export { Select };
export default Select;