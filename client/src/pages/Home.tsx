import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';

export function Home() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-sierra-gradient dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div 
          className="w-full max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo Section */}
          <motion.div 
            className="flex justify-center mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Logo className="mb-0" />
          </motion.div>
          
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              검색하세요
            </h1>
          </motion.div>
          
          
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
              <div className="relative glass-sierra rounded-2xl p-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="w-full px-6 py-4 text-lg bg-transparent border-0 rounded-xl
                           placeholder:text-muted-foreground/60 text-foreground
                           focus:outline-none focus:ring-0
                           transition-all duration-300"
                  autoFocus
                />
                <motion.button 
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl
                           bg-primary text-primary-foreground shadow-md
                           hover:bg-primary/90 hover:shadow-lg 
                           transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           group/btn"
                  whileHover={!query.trim() ? {} : { scale: 1.02 }}
                  whileTap={!query.trim() ? {} : { scale: 0.98 }}
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
}