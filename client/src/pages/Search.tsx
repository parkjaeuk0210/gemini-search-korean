import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SearchInput } from '@/components/SearchInput';
import { SearchResults } from '@/components/SearchResults';
import { FollowUpInput } from '@/components/FollowUpInput';
import { SearchHistory } from '@/components/SearchHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceList } from '@/components/SourceList';
import { useSearchHistory } from '@/hooks/use-search-history';

interface ConversationItem {
  id: string;
  query: string;
  results: any;
  timestamp: number;
  type: 'original' | 'followup';
  isLoading?: boolean;
}

export function Search() {
  const [location, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [isMainLoading, setIsMainLoading] = useState(false);
  
  const { addSearchResult } = useSearchHistory();
  
  // Extract query from URL, handling both initial load and subsequent navigation
  const getQueryFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('q') || '';
  };
  
  const [searchQuery, setSearchQuery] = useState(getQueryFromUrl);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery, refetchCounter],
    queryFn: async () => {
      if (!searchQuery) return null;
      
      // 로딩 상태 시작
      setIsMainLoading(true);
      
      // 새로운 검색 항목 추가 (로딩 상태)
      const newItemId = Date.now().toString();
      setConversationHistory(prev => [...prev.filter(item => !item.isLoading), {
        id: newItemId,
        query: searchQuery,
        results: null,
        timestamp: Date.now(),
        type: 'original',
        isLoading: true,
      }]);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const result = await response.json();
        console.log('Search API Response:', JSON.stringify(result, null, 2));
        
        if (result.sessionId) {
          setSessionId(result.sessionId);
          
          // 로딩 상태 업데이트
          setConversationHistory(prev => prev.map(item => 
            item.id === newItemId 
              ? { ...item, results: result, isLoading: false }
              : item
          ));
          
          // 검색 기록에 추가
          addSearchResult({
            query: searchQuery,
            summary: result.summary || '',
            sources: result.sources || [],
            sessionId: result.sessionId,
          });
        }
        
        setIsMainLoading(false);
        return result;
      } catch (error) {
        setIsMainLoading(false);
        // 에러 시 로딩 항목 제거
        setConversationHistory(prev => prev.filter(item => item.id !== newItemId));
        throw error;
      }
    },
    enabled: !!searchQuery,
  });

  // Follow-up mutation
  const followUpMutation = useMutation({
    mutationFn: async (followUpQuery: string) => {
      // 추가 질문 항목 추가 (로딩 상태)
      const newItemId = Date.now().toString();
      setConversationHistory(prev => [...prev, {
        id: newItemId,
        query: followUpQuery,
        results: null,
        timestamp: Date.now(),
        type: 'followup',
        isLoading: true,
      }]);
      
      try {
        if (!sessionId) {
          const response = await fetch(`/api/search?q=${encodeURIComponent(followUpQuery)}`);
          if (!response.ok) throw new Error('Search failed');
          const result = await response.json();
          console.log('New Search API Response:', JSON.stringify(result, null, 2));
          if (result.sessionId) {
            setSessionId(result.sessionId);
          }
          
          // 로딩 상태 업데이트
          setConversationHistory(prev => prev.map(item => 
            item.id === newItemId 
              ? { ...item, results: result, isLoading: false, type: 'original' }
              : item
          ));
          
          return result;
        }

        const response = await fetch('/api/follow-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            query: followUpQuery,
          }),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            const newResponse = await fetch(`/api/search?q=${encodeURIComponent(followUpQuery)}`);
            if (!newResponse.ok) throw new Error('Search failed');
            const result = await newResponse.json();
            console.log('Fallback Search API Response:', JSON.stringify(result, null, 2));
            if (result.sessionId) {
              setSessionId(result.sessionId);
            }
            
            // 로딩 상태 업데이트
            setConversationHistory(prev => prev.map(item => 
              item.id === newItemId 
                ? { ...item, results: result, isLoading: false, type: 'original' }
                : item
            ));
            
            return result;
          }
          throw new Error('Follow-up failed');
        }
        
        const result = await response.json();
        console.log('Follow-up API Response:', JSON.stringify(result, null, 2));
        
        // 로딩 상태 업데이트
        setConversationHistory(prev => prev.map(item => 
          item.id === newItemId 
            ? { ...item, results: result, isLoading: false }
            : item
        ));
        
        return result;
      } catch (error) {
        // 에러 시 로딩 항목 제거
        setConversationHistory(prev => prev.filter(item => item.id !== newItemId));
        throw error;
      }
    },
  });

  const handleSearch = async (newQuery: string) => {
    if (newQuery === searchQuery) {
      // If it's the same query, increment the refetch counter to trigger a new search
      setRefetchCounter(c => c + 1);
    } else {
      // Clear all states for new search
      setSessionId(null);
      setConversationHistory([]);
      setSearchQuery(newQuery);
    }
    // Update URL without triggering a page reload
    const newUrl = `/search?q=${encodeURIComponent(newQuery)}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleFollowUp = async (newFollowUpQuery: string) => {
    await followUpMutation.mutateAsync(newFollowUpQuery);
  };

  // 검색 기록에서 항목 선택 시 처리
  const handleSelectHistory = (query: string, result: any) => {
    setSessionId(result.sessionId || null);
    setConversationHistory([{
      id: Date.now().toString(),
      query: query,
      results: result,
      timestamp: Date.now(),
      type: 'original',
      isLoading: false,
    }]);
    setSearchQuery(query);
    
    // URL 업데이트
    const newUrl = `/search?q=${encodeURIComponent(query)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Automatically start search when component mounts or URL changes
  useEffect(() => {
    const query = getQueryFromUrl();
    if (query && query !== searchQuery) {
      setSessionId(null);
      setConversationHistory([]);
      setSearchQuery(query);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-sierra-gradient dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Loading Progress Bar */}
      {(isMainLoading || followUpMutation.isPending) && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: "0%" }}
            animate={{ 
              width: ["0%", "70%", "90%", "100%"],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-20 glass-sierra border-b border-border/30 px-4 md:px-6 py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로
          </Button>

          {/* Search Input */}
          <div className="flex-1 max-w-2xl">
            <SearchInput
              onSearch={handleSearch}
              initialValue={searchQuery}
              isLoading={isLoading}
              autoFocus={false}
            />
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search History Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <SearchHistory 
              onSelectHistory={handleSelectHistory}
              className="sticky top-24"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Conversation History */}
              {conversationHistory.map((item, index) => {
                // followup 타입인 항목들의 순서를 계산
                const followupNumber = conversationHistory
                  .slice(0, index + 1)
                  .filter(historyItem => historyItem.type === 'followup').length;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Divider for follow-up questions */}
                    {item.type === 'followup' && (
                      <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                        <span className="text-sm text-muted-foreground glass-sierra px-4 py-2 rounded-full">
                          💬 추가 질문 {followupNumber}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
                      </div>
                    )}
                    
                    <SearchResults
                      query={item.query}
                      results={item.results}
                      isLoading={item.isLoading || false}
                      error={undefined}
                      isFollowUp={item.type === 'followup'}
                      originalQuery={conversationHistory[0]?.query || ''}
                    />
                  </motion.div>
                );
              })}

              {/* Follow-up Input */}
              {conversationHistory.length > 0 && !isMainLoading && !followUpMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="max-w-3xl mx-auto"
                >
                  <FollowUpInput
                    onSubmit={handleFollowUp}
                    isLoading={followUpMutation.isPending}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}