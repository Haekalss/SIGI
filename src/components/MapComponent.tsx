"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, Point, FeatureCollection } from 'geojson';
import Legend from './Legend';
import InfoPanel from './InfoPanel';

interface MapComponentProps {
  gempaData: FeatureCollection<Point>;
  cuacaData?: FeatureCollection<Point>;
}

export default function MapComponent({ gempaData, cuacaData }: MapComponentProps) {
  // Hitung total untuk InfoPanel
  const totalGempa = gempaData?.features?.length || 0;
  const totalCuaca = cuacaData?.features?.length || 0;
  const totalProvinsiCuaca = (() => {
    if (!cuacaData) return 0;
    const provinces = new Set<string>();
    cuacaData.features.forEach((feature) => {
      const provinsi = feature.properties?.provinsi;
      if (typeof provinsi === 'string' && provinsi.length > 0) {
        provinces.add(provinsi);
      }
    });
    return provinces.size;
  })();
  const lastUpdate = new Date().toLocaleString('id-ID');

  // Popup untuk data gempa BMKG
  const onEachGempa = (feature: Feature<Point>, layer: L.Layer) => {
    if (feature.properties) {
      const { lokasi, magnitude, kedalaman, waktu, potensi } = feature.properties;
      const mag = parseFloat(magnitude);
      const color = mag >= 5.0 ? '#dc2626' : '#fbbf24';
      
      const potensiIsSafe = potensi?.toLowerCase().includes('tidak');

      const popupContent = `
        <div class="quake-popup-content" style="--quake-accent:${color};">
          <div class="quake-popup-header">
            <div class="quake-popup-pulse" aria-hidden="true"></div>
            <div class="quake-popup-heading">
              <span class="quake-popup-label">Gempa Bumi</span>
              <span class="quake-popup-title">Magnitudo ${magnitude}</span>
            </div>
          </div>
          <div class="quake-popup-details">
            <div>
              <p class="quake-popup-location">📍 ${lokasi}</p>
              <p class="quake-popup-time">🕐 ${waktu}</p>
            </div>
            <div class="quake-popup-metrics">
              <div>
                <span class="quake-popup-metric-label">Kedalaman</span>
                <span class="quake-popup-metric-value">${kedalaman}</span>
              </div>
              <div>
                <span class="quake-popup-metric-label">Intensitas</span>
                <span class="quake-popup-metric-value">M${magnitude}</span>
              </div>
            </div>
          </div>
          <div class="quake-popup-alert ${potensiIsSafe ? 'quake-popup-alert--safe' : 'quake-popup-alert--warn'}">
            <span class="quake-popup-alert-icon">${potensiIsSafe ? '✅' : '⚠️'}</span>
            <span class="quake-popup-alert-text">${potensi}</span>
          </div>
          <p class="quake-popup-source">Sumber: BMKG Real-time</p>
        </div>
      `;
      layer.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'quake-popup',
        autoPan: true,
        autoPanPadding: [56, 80],
      });
    }
  };

  // Point to Layer untuk gempa BMKG dengan circle marker berdasarkan magnitude
  const pointToLayerGempa = (feature: Feature<Point>, latlng: L.LatLng) => {
    const magnitude = parseFloat(feature.properties?.magnitude || '0');
    const radius = 7;
    const color = magnitude >= 5.0 ? '#dc2626' : '#fbbf24';
    
    return L.circleMarker(latlng, {
      radius: radius,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
    });
  };

  // Popup untuk data cuaca
  const onEachCuaca = (feature: Feature<Point>, layer: L.Layer) => {
    if (feature.properties) {
      const { nama, provinsi, cuaca, emoji, temperature, feelsLike, humidity, pressure, windSpeed } = feature.properties;
      
      const popupContent = `
        <div class="weather-popup-content">
          <div class="weather-popup-header">
            <span class="weather-popup-emoji">${emoji}</span>
            <div class="weather-popup-heading">
              <span class="weather-popup-label">Kota</span>
              <span class="weather-popup-title">${nama}</span>
            </div>
          </div>
          <p class="weather-popup-meta"><strong>Provinsi:</strong> ${provinsi || '-'}</p>
          <p class="weather-popup-condition">${cuaca}</p>
          <ul class="weather-popup-stats">
            <li class="weather-popup-stat weather-popup-stat--temp">
              <span class="weather-popup-stat-label"><span>🌡️</span> Suhu</span>
              <span class="weather-popup-stat-value">${temperature}</span>
            </li>
            <li class="weather-popup-stat weather-popup-stat--wind">
              <span class="weather-popup-stat-label"><span>💨</span> Angin</span>
              <span class="weather-popup-stat-value">${windSpeed}</span>
            </li>
            <li class="weather-popup-stat">
              <span class="weather-popup-stat-label"><span>💧</span> Kelembaban</span>
              <span class="weather-popup-stat-value">${humidity}</span>
            </li>
            <li class="weather-popup-stat">
              <span class="weather-popup-stat-label"><span>🌡️</span> Terasa</span>
              <span class="weather-popup-stat-value">${feelsLike}</span>
            </li>
            <li class="weather-popup-stat">
              <span class="weather-popup-stat-label"><span>📊</span> Tekanan</span>
              <span class="weather-popup-stat-value">${pressure}</span>
            </li>
          </ul>
          <p class="weather-popup-source">Sumber: OpenWeatherMap Real-time</p>
        </div>
      `;
      layer.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'weather-popup',
        autoPan: true,
        autoPanPadding: [56, 80],
      });
    }
  };

  // Point to Layer untuk cuaca dengan custom icon
  const pointToLayerCuaca = (feature: Feature<Point>, latlng: L.LatLng) => {
    const emoji = feature.properties?.emoji || '🌤️';
    
    // Buat custom divIcon dengan emoji
    const weatherIcon = L.divIcon({
      html: `<div style="font-size: 24px; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
      className: 'weather-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    
    return L.marker(latlng, { icon: weatherIcon });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[-2.5, 118.0]} // Koordinat tengah Indonesia
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
        worldCopyJump={false}
        zoomControl={false}
      >
        {/* Tile Layer CartoDB Positron */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />

        {/* GeoJSON Layer untuk data gempa BMKG */}
        {gempaData && gempaData.features.length > 0 && (
          <GeoJSON
            key={`gempa-${gempaData.features.length}`}
            data={gempaData}
            onEachFeature={onEachGempa}
            pointToLayer={pointToLayerGempa}
          />
        )}

        {/* GeoJSON Layer untuk data cuaca */}
        {cuacaData && cuacaData.features.length > 0 && (
          <GeoJSON
            key={`cuaca-${cuacaData.features.length}`}
            data={cuacaData}
            onEachFeature={onEachCuaca}
            pointToLayer={pointToLayerCuaca}
          />
        )}
      </MapContainer>

      {/* Overlay Components */}
      <Legend />
      <InfoPanel 
        totalGempa={totalGempa}
        totalCuaca={totalCuaca}
        totalProvinsiCuaca={totalProvinsiCuaca}
        lastUpdate={lastUpdate}
      />
    </div>
  );
}

