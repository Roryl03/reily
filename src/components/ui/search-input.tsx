import { Search, X } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  onClear?: () => void
  wrapperClassName?: string
}

export function SearchInput({
  className,
  wrapperClassName,
  value,
  onClear,
  ...props
}: SearchInputProps) {
  const hasValue = value !== undefined && value !== ''

  return (
    <div className={cn('relative', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-sage-400"
        aria-hidden
      />
      <Input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        variant="search"
        value={value}
        className={cn(hasValue && onClear && 'pr-10', className)}
        {...props}
      />
      {onClear && hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-sage-500 hover:text-sage-800 focus-ring"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
