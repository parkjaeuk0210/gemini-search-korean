import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
  large?: boolean;
}

export function SearchInput({ 
  onSearch, 
  isLoading = false,
  initialValue = '',
  autoFocus = false,
  large = false,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "relative glass-sierra rounded-xl p-1.5 transition-all duration-300",
        large && "rounded-2xl p-2",
        isLoading && "animate-pulse"
      )}>
        {/* Search Icon */}
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60",
          large ? "left-5" : "left-4"
        )}>
          <Search className={cn(
            large ? "h-5 w-5" : "h-4 w-4"
          )} />
        </div>

        {/* Input */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어를 입력하세요"
          className={cn(
            "w-full bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50",
            "transition-all duration-200 rounded-lg",
            large ? "pl-12 pr-20 py-3 text-lg" : "pl-11 pr-16 py-2.5 text-sm",
            "focus:placeholder:text-muted-foreground/30"
          )}
          disabled={isLoading}
          autoFocus={autoFocus}
        />

        {/* Search Button */}
        <motion.button 
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex items-center justify-center rounded-lg",
            "bg-primary text-primary-foreground shadow-sm",
            "hover:bg-primary/90 hover:shadow-md transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary",
            large ? "px-4 py-2.5" : "px-3 py-2"
          )}
          whileHover={!isLoading && query.trim() ? { scale: 1.02 } : {}}
          whileTap={!isLoading && query.trim() ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <Loader2 className={cn(
              "animate-spin", 
              large ? "h-5 w-5" : "h-4 w-4"
            )} />
          ) : (
            <Search className={cn(
              large ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}