import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 min-h-11 px-5',
  {
    variants: {
      variant: {
        default: 'bg-sage-500 text-white hover:bg-sage-600 shadow-sm',
        secondary: 'bg-cream-100 text-sage-800 hover:bg-cream-300 border border-sage-200',
        outline: 'border-2 border-sage-300 bg-transparent hover:bg-sage-50 text-sage-700',
        ghost: 'hover:bg-sage-100 text-sage-700',
        destructive: 'bg-terracotta text-white hover:opacity-90',
        link: 'text-sage-600 underline-offset-4 hover:underline min-h-0 px-0',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5',
        sm: 'min-h-9 rounded-lg px-3 text-xs',
        lg: 'min-h-12 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11 p-0',
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
