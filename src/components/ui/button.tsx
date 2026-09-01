import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 active:opacity-80 touch-scale max-lg:rounded-[14px] lg:rounded-xl min-h-11 px-5',
  {
    variants: {
      variant: {
        default: 'bg-hunter text-white hover:bg-sage-600 shadow-sm max-lg:shadow-[0_2px_8px_rgba(53,94,59,0.2)]',
        secondary: 'bg-white text-sage-800 hover:bg-sage-50 border border-sage-200/80 max-lg:shadow-sm',
        outline: 'border border-sage-300/80 bg-transparent hover:bg-sage-50 text-sage-700',
        ghost: 'hover:bg-sage-100/80 text-sage-700 active:scale-100',
        destructive: 'bg-terracotta text-white hover:opacity-90',
        link: 'text-hunter underline-offset-4 hover:underline min-h-0 px-0 active:scale-100',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5 max-lg:min-h-[50px] max-lg:text-[17px]',
        sm: 'min-h-9 rounded-lg px-3 text-xs active:scale-100',
        lg: 'min-h-12 rounded-2xl px-8 text-base max-lg:min-h-[54px] max-lg:w-full',
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
