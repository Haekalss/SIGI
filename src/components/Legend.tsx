'use client';

import { useState, useSyncExternalStore } from 'react';

interface LegendItem {
  label: string;
  color: string;
  icon?: string;
}

const legendItems: LegendItem[] = [
  { label: 'Gempa M ≥ 5.0', color: '#dc2626', icon: '●' },
  { label: 'Gempa M < 5.0', color: '#fbbf24', icon: '●' },
  { label: 'Cuaca Kota', color: '#3b82f6', icon: '●' },
];

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => undefined;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(query).matches;
    },
    () => false
  );
}

export default function Legend() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [manualState, setManualState] = useState<boolean | null>(null);
  const defaultOpen = !isMobile;
  const isOpen = manualState ?? defaultOpen;

  const handleToggle = () => {
    setManualState((current) => {
      const resolved = (current ?? defaultOpen) as boolean;
      const next = !resolved;
      return next === defaultOpen ? null : next;
    });
  };

  return (
    <div className="absolute left-4 bottom-20 md:left-6 md:bottom-6 z-50 rounded-2xl border border-white/60 bg-white/85 p-0 shadow-xl backdrop-blur">
      {/* Header */}
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${
          isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
        onClick={handleToggle}
      >
        <span>Keterangan Peta</span>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="rounded-b-2xl border-t border-gray-100 px-3 py-2 space-y-1.5">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm" style={{ color: item.color }}>{item.icon}</span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
