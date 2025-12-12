'use client';

import dynamic from 'next/dynamic';
import type { FeatureCollection, Point } from 'geojson';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-lg text-gray-600">Memuat peta Indonesia...</p>
        <p className="text-sm text-gray-500 mt-2">Mengambil data terbaru...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  gempaData: FeatureCollection<Point>;
  cuacaData?: FeatureCollection<Point>;
}

export default function MapWrapper({ gempaData, cuacaData }: MapWrapperProps) {
  return (
    <div className="relative h-full w-full">
      <MapComponent gempaData={gempaData} cuacaData={cuacaData} />
    </div>
  );
}
