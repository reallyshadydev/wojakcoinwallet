import * as React from 'react'

import { cn } from '@/lib/utils'

/** Props applied to password inputs so password managers (1Password, LastPass, etc.) don't offer to save. */
const PASSWORD_MANAGER_IGNORE = {
  autoComplete: 'off',
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-form-type': 'other',
} as const

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    const ignoreProps = type === 'password' ? PASSWORD_MANAGER_IGNORE : {}
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...ignoreProps}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
