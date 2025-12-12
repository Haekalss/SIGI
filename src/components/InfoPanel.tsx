'use client';

import { useState, useSyncExternalStore } from 'react';

interface InfoPanelProps {
  totalGempa: number;
  totalCuaca: number;
  totalProvinsiCuaca: number;
  lastUpdate: string;
}

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

export default function InfoPanel({ totalGempa, totalCuaca, totalProvinsiCuaca, lastUpdate }: InfoPanelProps) {
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
    <div className="absolute top-6 right-6 z-50 rounded-2xl border border-white/40 bg-white/90 shadow-lg backdrop-blur">
      {/* Header */}
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${
          isOpen ? 'rounded-t-2xl' : 'rounded-2xl'
        }`}
        onClick={handleToggle}
      >
        <h3 className="text-xs font-semibold text-gray-700">Data</h3>
        <span className="text-gray-400 text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="rounded-b-2xl border-t border-white/40 bg-white/80 px-3 py-2 space-y-2">
          {/* Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">Gempa (M ≥ 5.0)</span>
              <span className="text-sm font-semibold text-gray-900">{totalGempa}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">Kota (Cuaca)</span>
              <span className="text-sm font-semibold text-gray-900">{totalCuaca}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-600">Provinsi Tercakup</span>
              <span className="text-sm font-semibold text-gray-900">{totalProvinsiCuaca}</span>
            </div>
          </div>

          {/* Last Update */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Update: {lastUpdate}</p>
          </div>

          {/* Source */}
          <div className="text-center py-1.5 bg-gray-800 rounded">
            <p className="text-xs text-white font-medium">BMKG • OpenWeather</p>
          </div>
        </div>
      )}
    </div>
  );
}
