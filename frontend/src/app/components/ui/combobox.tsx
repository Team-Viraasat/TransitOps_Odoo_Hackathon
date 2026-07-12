'use client'

import { useState, useMemo } from 'react'
import { ChevronsUpDownIcon } from 'lucide-react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { cn } from '@/app/components/ui/utils'

export type ComboboxOption = {
  label: string;
  value: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
  disabled
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role='combobox'
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-accent/50',
          className
        )}
        aria-label={placeholder}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] rounded-xl border-border/60 p-0 shadow-sm'>
        <Command>
          <CommandInput placeholder={`Search...`} className='h-9' />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  className='pr-2'
                  data-checked={value === option.value}
                  onSelect={(currentValue) => {
                    // CommandItem lowercases the value by default, but we use the option.value
                    // to ensure exact match when passing back.
                    onChange(currentValue === value ? '' : option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
