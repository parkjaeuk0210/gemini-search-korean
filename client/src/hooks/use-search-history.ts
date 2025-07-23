import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  id: string;
  query: string;
  summary: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  sessionId?: string;
  timestamp: number;
}

const STORAGE_KEY = 'gemini-search-history';
const MAX_HISTORY_ITEMS = 20;

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [history]);

  const addSearchResult = (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any existing item with the same query
      const filtered = prev.filter(historyItem => 
        historyItem.query.toLowerCase() !== item.query.toLowerCase()
      );
      
      // Add new item at the beginning
      const updated = [newItem, ...filtered];
      
      // Keep only the most recent items
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const removeSearchResult = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getHistoryItem = (id: string) => {
    return history.find(item => item.id === id);
  };

  return {
    history,
    addSearchResult,
    removeSearchResult,
    clearHistory,
    getHistoryItem,
  };
}