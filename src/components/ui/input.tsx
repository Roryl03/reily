import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => (
    <input
      type={type}
      className={cn(
        variant === 'search'
          ? 'ios-search'
          : 'flex min-h-11 w-full rounded-xl border border-sage-200 bg-white px-4 py-2 text-base text-sage-900 placeholder:text-sage-400 focus-ring max-lg:min-h-[50px] max-lg:rounded-[14px] max-lg:text-[17px]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-xl border border-sage-200 bg-white px-4 py-3 text-base text-sage-900 placeholder:text-sage-400 focus-ring max-lg:rounded-[14px] max-lg:text-[17px]',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium text-sage-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 max-lg:text-[15px]',
        className,
      )}
      {...props}
    />
  )
}
