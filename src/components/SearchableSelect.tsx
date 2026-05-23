import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SearchableSelect = ({ options, value, onValueChange, placeholder = 'Select...' }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    options.filter(o =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.sublabel?.toLowerCase().includes(search.toLowerCase()))
    ), [options, search]);

  const selected = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-8 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
          ) : filtered.map(o => (
            <button
              key={o.value}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted flex items-center gap-2 transition-colors',
                value === o.value && 'bg-muted'
              )}
              onClick={() => { onValueChange(o.value); setOpen(false); setSearch(''); }}
            >
              <Check className={cn('h-3.5 w-3.5 shrink-0', value === o.value ? 'opacity-100' : 'opacity-0')} />
              <div className="min-w-0">
                <p className="truncate">{o.label}</p>
                {o.sublabel && <p className="text-xs text-muted-foreground truncate">{o.sublabel}</p>}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
