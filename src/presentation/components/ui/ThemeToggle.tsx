'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} />; // Placeholder to avoid layout shift
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-full hover:bg-foreground/5 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 stroke-[1.5] text-foreground" />
      ) : (
        <Moon className="h-4 w-4 stroke-[1.5] text-foreground" />
      )}
    </button>
  );
}
