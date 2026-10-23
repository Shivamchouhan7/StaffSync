/* eslint-disable react-refresh/only-export-components */
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const createCardPart = (displayName, className) => {
  const Component = forwardRef(({ className: additionalClassName, ...props }, ref) => (
    <div ref={ref} className={cn(className, additionalClassName)} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
};

const Card = createCardPart('Card', 'ui-card');
const CardHeader = createCardPart('CardHeader', 'ui-card-header');
const CardTitle = createCardPart('CardTitle', 'ui-card-title');
const CardDescription = createCardPart('CardDescription', 'ui-card-description');
const CardContent = createCardPart('CardContent', 'ui-card-content');
const CardFooter = createCardPart('CardFooter', 'ui-card-footer');

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
export default Card;