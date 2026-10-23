import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('ui-textarea', className)} {...props} />
));

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;