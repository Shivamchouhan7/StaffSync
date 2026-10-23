import { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext(null);

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value === undefined ? internalValue : value;
  const setActiveValue = (nextValue) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={cn('ui-tabs', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, ...props }) => (
  <div role="tablist" className={cn('ui-tabs-list', className)} {...props} />
);

const TabsTrigger = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used inside Tabs.');
  const active = context.activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn('ui-tabs-trigger', active && 'ui-tabs-trigger-active', className)}
      onClick={() => context.setActiveValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used inside Tabs.');
  if (context.activeValue !== value) return null;

  return <div role="tabpanel" className={cn('ui-tabs-content', className)} {...props}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;