import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-md border-2 border-sage-300 focus-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-sage-500 data-[state=checked]:bg-sage-500',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

export function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer min-h-11 py-1">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-sm text-sage-800">{label}</span>
    </label>
  )
}
