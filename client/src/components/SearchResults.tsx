import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SourceList } from '@/components/SourceList';
import { Logo } from '@/components/Logo';

interface SearchResultsProps {
  query: string;
  results: any;
  isLoading: boolean;
  error?: Error;
  isFollowUp?: boolean;
  originalQuery?: string;
}

export function SearchResults({ 
  query,
  results,
  isLoading,
  error,
  isFollowUp,
  originalQuery
}: SearchResultsProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 추가 질문이 아닌 경우에만 스크롤
    if (results && contentRef.current && !isFollowUp) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results, isFollowUp]);

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || '검색 중 오류가 발생했습니다. 다시 시도해주세요.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in-50">
        {/* Loading Header */}
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <h2 className="text-lg font-medium text-foreground">"{query}" 검색 중...</h2>
        </div>
        
        <div className="glass-sierra rounded-xl p-6">
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-[80px] w-full" />
          <Skeleton className="h-[80px] w-full" />
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <motion.div 
      ref={contentRef} 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Query Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        {isFollowUp && originalQuery && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-xs sm:text-sm text-muted-foreground/70">
              <span>원래 검색:</span>
              <span className="font-medium">"{originalQuery}"</span>
            </div>
            <div className="h-px bg-border w-full" />
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm sm:text-base text-muted-foreground">
          <span>{isFollowUp ? '추가 질문:' : ''}</span>
          <h1 className="font-serif text-lg sm:text-3xl text-foreground">"{query}"</h1>
        </div>
      </motion.div>

      {/* Sources Section */}
      {results.sources && results.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SourceList sources={results.sources} />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="glass-sierra rounded-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="py-4 px-8"
        >
          <div
            className={cn(
              "prose prose-slate max-w-none",
              "dark:prose-invert",
              "prose-headings:font-bold prose-headings:mb-4",
              "prose-h2:text-2xl prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2 prose-h2:border-border",
              "prose-h3:text-xl prose-h3:mt-6",
              "prose-p:text-base prose-p:leading-7 prose-p:my-4",
              "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
              "prose-li:my-2 prose-li:marker:text-muted-foreground",
              "prose-strong:font-semibold",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80",
            )}
            dangerouslySetInnerHTML={{ 
              __html: results.summary
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}