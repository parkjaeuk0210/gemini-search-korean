import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export function Logo({ className, animate = false }: LogoProps) {
  return (
    <motion.div
      className={cn("relative flex items-center gap-3", className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1
      }}
    >
      {/* Search Icon with Sierra Blue gradient */}
      <motion.div
        className="relative p-3 rounded-full glass-sierra"
        animate={animate ? { rotate: 360 } : {}}
        transition={{
          duration: 20,
          repeat: animate ? Infinity : 0,
          ease: "linear"
        }}
      >
        <Search className="w-6 h-6 text-primary" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-md -z-10" />
      </motion.div>
      
      {/* Simple text logo */}
      <motion.h1
        className="text-2xl font-bold text-gradient"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        검색
      </motion.h1>
    </motion.div>
  );
}