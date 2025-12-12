import Image from 'next/image';
import { getGempaM5, getCuacaTerkini } from '@/lib/bmkg';
import MapWrapper from '@/components/MapWrapper';

export default async function Home() {
  // Fetch semua data dari BMKG secara paralel
  const [gempaData, cuacaData] = await Promise.all([
    getGempaM5(),
    getCuacaTerkini(),
  ]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/nus.svg"
                alt="SIG Nusantara "
                width={40}
                height={40}
                className="h-10 w-10"
                priority
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  SIG Nusantara
                </h1>
                <p className="text-xs text-gray-500">BMKG & OpenWeather</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapWrapper 
          gempaData={gempaData}
          cuacaData={cuacaData}
        />
      </div>
    </div>
  );
}
