/**
 * LABEL COMPONENT - Component label cho form inputs
 * 
 * Chức năng:
 * - Label cho các form fields
 * - Hỗ trợ htmlFor attribute
 */

import { forwardRef } from "react";

const Label = forwardRef(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
