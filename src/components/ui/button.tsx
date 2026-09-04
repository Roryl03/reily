import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-semibold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 active:opacity-90 touch-scale rounded-xl min-h-11 px-5',
  {
    variants: {
      variant: {
        default: 'bg-hunter text-white hover:bg-hunter-hover shadow-sm',
        secondary:
          'bg-hunter-light text-hunter hover:bg-sage-100 border border-hunter/25',
        outline: 'border border-border bg-surface hover:bg-sage-50 text-hunter',
        ghost: 'hover:bg-sage-100 text-sage-800 active:scale-100',
        destructive: 'bg-error text-white hover:opacity-90',
        link: 'text-hunter underline-offset-4 hover:text-hunter-hover hover:underline min-h-0 px-0 active:scale-100',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5',
        sm: 'min-h-9 rounded-lg px-3 text-sm active:scale-100',
        lg: 'min-h-12 rounded-xl px-8 text-base max-lg:w-full',
        icon: 'h-11 w-11 p-0 active:scale-95',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }
