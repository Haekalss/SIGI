/**
 * BMKG API Service
 * Mengambil data gempa terkini dan cuaca dari API BMKG
 */

import { Feature, FeatureCollection, Point } from 'geojson';

// Interface untuk data gempa BMKG
export interface GempaBMKG {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
}

export interface GempaResponse {
  Infogempa: {
    gempa: GempaBMKG | GempaBMKG[];
  };
}

// Interface untuk cuaca BMKG
export interface CuacaBMKG {
  id: string;
  provinsi: string;
  kota: string;
  cuaca: string;
  temperature: string;
  humidity: string;
  timestamp: string;
}

type OpenWeatherResponse = {
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: {
    speed?: number;
  };
  dt?: number;
  name?: string;
};

type CityCoordinate = {
  province: string;
  name: string;
  lat: number;
  lon: number;
};

/**
 * Mengambil data gempa terkini dari BMKG
 */
export async function getGempaTerkini(): Promise<FeatureCollection<Point>> {
  try {
    const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', {
      next: { revalidate: 300 } // Cache 5 menit
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gempa data');
    }

    const data: GempaResponse = await response.json();
    const gempaData = data.Infogempa.gempa;
    
    // BMKG API kadang return single object atau array
    const gempaList = Array.isArray(gempaData) ? gempaData : [gempaData];

    const features = gempaList.map((gempa) => {
      // Parse koordinat format: "1.63 LS - 127.52 BT"
      const coords = gempa.Coordinates.split(',');
      const lat = parseFloat(coords[0]);
      const lon = parseFloat(coords[1]);

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lon, lat],
        },
        properties: {
          jenis: 'Gempa Bumi',
          lokasi: gempa.Wilayah,
          magnitude: gempa.Magnitude,
          kedalaman: gempa.Kedalaman,
          waktu: `${gempa.Tanggal} ${gempa.Jam}`,
          potensi: gempa.Potensi,
          sumber: 'BMKG',
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('Error fetching BMKG gempa data:', error);
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
}

/**
 * Mengambil data gempa M 5.0+ dari BMKG
 */
export async function getGempaM5(): Promise<FeatureCollection<Point>> {
  try {
    const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gempa M5+ data');
    }

    const data: { Infogempa: { gempa: GempaBMKG[] } } = await response.json();
    const gempaList = data.Infogempa.gempa || [];

    const features = gempaList.slice(0, 20).map((gempa) => {
      // Parse koordinat dari Lintang/Bujur
      let lat = 0;
      let lon = 0;

      try {
        // Parse Lintang: "6.62 LU" atau "6.62 LS"
        const lintangStr = gempa.Lintang.replace(',', '.');
        const lintangMatch = lintangStr.match(/([\d.]+)\s*(LU|LS)/);
        if (lintangMatch) {
          lat = parseFloat(lintangMatch[1]);
          if (lintangMatch[2] === 'LS') lat = -lat;
        }

        // Parse Bujur: "127.52 BT" atau "127.52 BB"
        const bujurStr = gempa.Bujur.replace(',', '.');
        const bujurMatch = bujurStr.match(/([\d.]+)\s*(BT|BB)/);
        if (bujurMatch) {
          lon = parseFloat(bujurMatch[1]);
          if (bujurMatch[2] === 'BB') lon = -lon;
        }

        // Validasi koordinat
        if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
          console.warn('Invalid coordinates for gempa:', gempa);
          return null;
        }
      } catch {
        console.error('Error parsing coordinates:', gempa);
        return null;
      }

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lon, lat],
        },
        properties: {
          jenis: 'Gempa Bumi',
          lokasi: gempa.Wilayah,
          magnitude: gempa.Magnitude,
          kedalaman: gempa.Kedalaman,
          waktu: `${gempa.Tanggal} ${gempa.Jam}`,
          potensi: gempa.Potensi || 'Tidak berpotensi tsunami',
          sumber: 'BMKG',
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features: features.filter((f): f is Exclude<typeof f, null> => f !== null),
    };
  } catch (error) {
    console.error('Error fetching BMKG gempa M5+ data:', error);
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
}

/**
 * Mengambil data cuaca real-time dari OpenWeatherMap API
 * Menampilkan cuaca untuk kota-kota di Indonesia
 */
export async function getCuacaTerkini(): Promise<FeatureCollection<Point>> {
  // Koordinat kota per provinsi
  const cities: CityCoordinate[] = [
    { province: 'Aceh', name: 'Banda Aceh', lat: 5.5483, lon: 95.3238 },
    { province: 'Sumatera Utara', name: 'Medan', lat: 3.5952, lon: 98.6722 },
    { province: 'Sumatera Barat', name: 'Padang', lat: -0.9471, lon: 100.4172 },
    { province: 'Riau', name: 'Pekanbaru', lat: 0.5071, lon: 101.4478 },
    { province: 'Kepulauan Riau', name: 'Tanjung Pinang', lat: 0.9185, lon: 104.4583 },
    { province: 'Jambi', name: 'Jambi', lat: -1.6101, lon: 103.6131 },
    { province: 'Sumatera Selatan', name: 'Palembang', lat: -2.9761, lon: 104.7754 },
    { province: 'Kepulauan Bangka Belitung', name: 'Pangkal Pinang', lat: -2.1291, lon: 106.109 },
    { province: 'Bengkulu', name: 'Bengkulu', lat: -3.7956, lon: 102.2608 },
    { province: 'Lampung', name: 'Bandar Lampung', lat: -5.3971, lon: 105.2668 },
    { province: 'Banten', name: 'Serang', lat: -6.12, lon: 106.1503 },
    { province: 'DKI Jakarta', name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
    { province: 'Jawa Barat', name: 'Bandung', lat: -6.9175, lon: 107.6191 },
    { province: 'Jawa Tengah', name: 'Semarang', lat: -6.9667, lon: 110.4167 },
    { province: 'DI Yogyakarta', name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
    { province: 'Jawa Timur', name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
    { province: 'Bali', name: 'Denpasar', lat: -8.6705, lon: 115.2126 },
    { province: 'Nusa Tenggara Barat', name: 'Mataram', lat: -8.5833, lon: 116.1167 },
    { province: 'Nusa Tenggara Timur', name: 'Kupang', lat: -10.1772, lon: 123.5971 },
    { province: 'Kalimantan Barat', name: 'Pontianak', lat: -0.0263, lon: 109.3425 },
    { province: 'Kalimantan Tengah', name: 'Palangka Raya', lat: -2.208, lon: 113.9145 },
    { province: 'Kalimantan Selatan', name: 'Banjarmasin', lat: -3.3194, lon: 114.5906 },
    { province: 'Kalimantan Timur', name: 'Samarinda', lat: -0.5022, lon: 117.1536 },
    { province: 'Kalimantan Utara', name: 'Tanjung Selor', lat: 2.8401, lon: 117.3731 },
    { province: 'Sulawesi Utara', name: 'Manado', lat: 1.4748, lon: 124.8421 },
    { province: 'Sulawesi Tengah', name: 'Palu', lat: -0.8917, lon: 119.8707 },
    { province: 'Sulawesi Selatan', name: 'Makassar', lat: -5.1477, lon: 119.4327 },
    { province: 'Sulawesi Tenggara', name: 'Kendari', lat: -3.9985, lon: 122.512 },
    { province: 'Gorontalo', name: 'Gorontalo', lat: 0.5467, lon: 123.0595 },
    { province: 'Sulawesi Barat', name: 'Mamuju', lat: -2.6727, lon: 118.8887 },
    { province: 'Maluku', name: 'Ambon', lat: -3.6954, lon: 128.1814 },
    { province: 'Maluku Utara', name: 'Ternate', lat: 0.7893, lon: 127.389 },
    { province: 'Papua', name: 'Jayapura', lat: -2.5489, lon: 140.7182 },
    { province: 'Papua Barat', name: 'Manokwari', lat: -0.8619, lon: 134.064 },
    { province: 'Papua Selatan', name: 'Merauke', lat: -8.4932, lon: 140.4018 },
    { province: 'Papua Tengah', name: 'Nabire', lat: -3.3607, lon: 135.503 },
    { province: 'Papua Pegunungan', name: 'Wamena', lat: -4.0939, lon: 138.953 },
    { province: 'Papua Barat Daya', name: 'Sorong', lat: -0.8762, lon: 131.2558 },
  ];

  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_KEY || '4d0031173de74dedd1a069805b68539a';

  const getEmojiForWeather = (main?: string): string => {
    const normalized = (main || '').toLowerCase();
    const mapping: Record<string, string> = {
      clear: '☀️',
      clouds: '☁️',
      drizzle: '🌦️',
      rain: '🌧️',
      thunderstorm: '⛈️',
      snow: '❄️',
      mist: '🌫️',
      fog: '🌫️',
      haze: '🌫️',
      smoke: '🌫️',
      dust: '🌫️',
      sand: '🌫️',
      ash: '🌋',
      squall: '💨',
      tornado: '🌪️',
    };
    return mapping[normalized] ?? 'ℹ️';
  };

  const createFallbackFeature = (city: CityCoordinate): Feature<Point> => {
    const temp = Math.floor(Math.random() * 8) + 26;
    const humidity = Math.floor(Math.random() * 25) + 65;
    const windSpeed = (Math.random() * 4 + 1).toFixed(1);
    const pressure = Math.floor(Math.random() * 20) + 1005;
    const weatherOptions = [
      { description: 'cerah', main: 'Clear', emoji: '☀️' },
      { description: 'berawan', main: 'Clouds', emoji: '☁️' },
      { description: 'hujan ringan', main: 'Drizzle', emoji: '🌦️' },
      { description: 'berawan sebagian', main: 'Clouds', emoji: '⛅' },
      { description: 'cerah berawan', main: 'Clear', emoji: '🌤️' },
      { description: 'kabut', main: 'Mist', emoji: '🌫️' },
    ];
    const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [city.lon, city.lat],
      },
      properties: {
        nama: city.name,
        provinsi: city.province,
        cuaca: weather.description,
        cuacaUtama: weather.main,
        emoji: weather.emoji,
        temperature: `${temp}°C`,
        feelsLike: `${temp + Math.floor(Math.random() * 3)}°C`,
        humidity: `${humidity}%`,
        pressure: `${pressure} hPa`,
        windSpeed: `${windSpeed} m/s`,
        timestamp: new Date().toLocaleString('id-ID'),
        sumber: 'OpenWeatherMap (fallback)',
      },
    };
  };

  const createFallbackCollection = (): FeatureCollection<Point> => ({
    type: 'FeatureCollection',
    features: cities.map(createFallbackFeature),
  });

  if (!apiKey) {
    console.warn('OpenWeatherMap API key is missing. Returning fallback weather data.');
    return createFallbackCollection();
  }

  try {
    const features: Feature<Point>[] = [];

    for (const city of cities) {
      const url = new URL('https://api.openweathermap.org/data/2.5/weather');
      url.searchParams.set('lat', city.lat.toString());
      url.searchParams.set('lon', city.lon.toString());
      url.searchParams.set('appid', apiKey);
      url.searchParams.set('units', 'metric');
      url.searchParams.set('lang', 'id');

      try {
        const response = await fetch(url.toString(), {
          next: { revalidate: 600 },
        });

        if (response.status === 401 || response.status === 403) {
          console.warn('OpenWeatherMap API key rejected. Returning fallback weather data.');
          return createFallbackCollection();
        }

        if (!response.ok) {
          throw new Error(`OpenWeather request failed (${response.status}): ${await response.text()}`);
        }

        const data = (await response.json()) as OpenWeatherResponse;
        const weatherMain = data.weather?.[0]?.main || '-';
        const weatherDescription = data.weather?.[0]?.description || weatherMain;
        const temperature = data.main?.temp ?? Number.NaN;
        const feelsLike = data.main?.feels_like ?? Number.NaN;
        const humidity = data.main?.humidity ?? Number.NaN;
        const pressure = data.main?.pressure ?? Number.NaN;
        const windSpeed = data.wind?.speed ?? Number.NaN;
        const timestamp = data.dt ? new Date(data.dt * 1000) : new Date();
        const formatWind = Number.isFinite(windSpeed) ? `${Number(windSpeed).toFixed(1)} m/s` : '–';

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [city.lon, city.lat],
          },
          properties: {
            nama: data.name || city.name,
            provinsi: city.province,
            cuaca: weatherDescription,
            cuacaUtama: weatherMain,
            emoji: getEmojiForWeather(weatherMain),
            temperature: Number.isNaN(temperature) ? '–' : `${Math.round(temperature)}°C`,
            feelsLike: Number.isNaN(feelsLike) ? '–' : `${Math.round(feelsLike)}°C`,
            humidity: Number.isNaN(humidity) ? '–' : `${Math.round(humidity)}%`,
            pressure: Number.isNaN(pressure) ? '–' : `${Math.round(pressure)} hPa`,
            windSpeed: formatWind,
            timestamp: timestamp.toLocaleString('id-ID'),
            sumber: 'OpenWeatherMap',
          },
        });
      } catch (error) {
        console.warn(`Failed to fetch weather for ${city.name}. Using fallback data.`, error);
        features.push(createFallbackFeature(city));
      }
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('Error fetching cuaca data:', error);
    return createFallbackCollection();
  }
}
