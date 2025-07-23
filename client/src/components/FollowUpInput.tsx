import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUpInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

export function FollowUpInput({ 
  onSubmit,
  isLoading = false,
}: FollowUpInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center gap-2 mb-4 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="text-sm font-medium">추가 질문</span>
        <div className="flex-1 h-px bg-border ml-2" />
      </motion.div>

      {/* Input Container */}
      <motion.div 
        className="relative group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main Container - 글래스모피즘 스타일 */}
        <div className="relative flex items-center glass-sierra rounded-xl">
          {/* Input Field */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="추가 질문을 해보세요..."
            className="flex-1 px-4 py-3 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:placeholder:text-muted-foreground/40"
            disabled={isLoading}
          />

          {/* Submit Button */}
          <motion.button 
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className={cn(
              "flex items-center justify-center gap-2 m-1.5 px-4 py-2 rounded-lg",
              "bg-gradient text-white shadow-sm transition-all duration-300",
              "hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
              "disabled:hover:shadow-sm group/btn"
            )}
            whileHover={!isLoading && query.trim() ? { scale: 1.02 } : {}}
            whileTap={!isLoading && query.trim() ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">전송 중...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium">질문</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Suggested Questions */}
      <motion.div 
        className="mt-3 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {['자세히 설명해주세요', '다른 예시는?', '관련된 내용은?'].map((suggestion, index) => (
          <motion.button
            key={suggestion}
            onClick={() => {
              if (!isLoading) {
                onSubmit(suggestion);
              }
            }}
            className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200 hover:scale-105"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            disabled={isLoading}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}