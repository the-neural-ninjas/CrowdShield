import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';
import type { Map, LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Activity, RefreshCw, AlertTriangle, RotateCcw, Route, Target, X } from 'lucide-react';

// Add custom CSS for alert popup
const alertPopupStyles = `
  .alert-popup .mapboxgl-popup-content {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: 2px solid #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
    font-family: 'Inter', sans-serif;
  }
  
  .alert-popup .mapboxgl-popup-tip {
    border-top-color: #ef4444;
  }
  
  .alert-popup .mapboxgl-popup-close-button {
    color: white;
    font-size: 18px;
    padding: 4px 8px;
  }
  
  .alert-popup .mapboxgl-popup-close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

// Inject styles when component mounts
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = alertPopupStyles;
  document.head.appendChild(styleElement);
}

// Note: Mapbox uses [lng, lat]
const CENTER: [number, number] = [73.67068535015768, 19.966393485203557];

const ZONE_DATA = [
  { 
    name: 'O building', 
    capacity: 15000, 
    current: 12450, 
    status: 'warning', 
    coordinates: [73.67058268174448, 19.96653781496715] as [number, number] 
  },
  { 
    name: 'Olive Canteen', 
    capacity: 5000, 
    current: 4200, 
    status: 'warning', 
    coordinates: [73.66875109438006, 19.96543260800829] as [number, number] 
  },
  { 
    name: 'O-S Link', 
    capacity: 4000, 
    current: 3800, 
    status: 'normal', 
    coordinates: [73.67032803212618, 19.96677251522285] as [number, number] 
  },
  { 
    name: 'S building ', 
    capacity: 2000, 
    current: 1850, 
    status: 'normal', 
    coordinates: [73.66933604738352, 19.96665444362413] as [number, number] 
  },
];

// Route coordinates for different zone combinations
const ROUTE_COORDINATES = {
  // Zone 1 to Zone 2 (O building to Olive Canteen)
  'O building-Olive Canteen': [
    [73.67053402587236, 19.966794393207216],
    [73.67008157591496, 19.966685353809737],
    [73.67008157591496, 19.965911171919686],
    [73.669223081124, 19.965878459925168],
    [73.66917667600018, 19.965551339606687]
  ] as [number, number][],
  
  // O building to S building
  'O building-S building ': [
    [73.67058630643989, 19.96676736966682],
    [73.6700698746943, 19.96669964088853],
    [73.67004585461312, 19.965943334221752],
    [73.66927721201503, 19.9659094696593],
    [73.66927721201503, 19.9659094696593],
    [73.66919314173087, 19.96613523327164],
    [73.66933726221802, 19.966541606959414],
    [73.66955344294873, 19.96674479341063]
  ] as [number, number][],
  
  // O building to S Link (new route)
  'O building-O-S Link': [
    [73.67049452991118, 19.96675615707322],
    [73.6701033481368, 19.96674201598807],
    [73.67004316632536, 19.96699655532679],
    [73.66959932546597, 19.966819791940708]
  ] as [number, number][],
  
  // S building to Olive Canteen (new route)
  'S building -Olive Canteen': [
    [73.66925328005019, 19.966749086530807],
    [73.66925654246184, 19.966374311275523],
    [73.66924836725308, 19.96594401659593],
    [73.66921566641804, 19.965559823925656],
    [73.66887230765, 19.96553677233567]
  ] as [number, number][]
};

const FALLBACK_TOKEN = 'pk.eyJ1Ijoicm91bmFrMDEiLCJhIjoiY21lbWE1YjE0MG9vOTJqcXZuN2FldTRmeCJ9.4jn-C-5Rg836aWsCs52Oew';
const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN || FALLBACK_TOKEN;

// Validate token format
if (!token || token.length < 20) {
  console.warn('Invalid Mapbox token detected. Using fallback token.');
}

mapboxgl.accessToken = token;

// Route Recommendation Helpers
type Zone = {
  name: string;
  capacity: number;
  current: number;
  coordinates: [number, number];
};

const getRouteKey = (startZone: string, endZone: string) => {
  return `${startZone}-${endZone}`;
};

const drawSafeRoute = (map: Map, startZone: string, endZone: string) => {
  const routeKey = getRouteKey(startZone, endZone);
  const coordinates = ROUTE_COORDINATES[routeKey as keyof typeof ROUTE_COORDINATES];
  
  if (!coordinates) {
    console.warn(`No route found for ${startZone} to ${endZone}`);
    return;
  }

  const geojson = {
    type: 'FeatureCollection' as const,
    features: [{ 
      type: 'Feature' as const, 
      geometry: { 
        type: 'LineString' as const, 
        coordinates: coordinates 
      }, 
      properties: {} 
    }]
  };

  if (!map.getSource('safe-route')) {
    map.addSource('safe-route', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'safe-route-line',
      type: 'line',
      source: 'safe-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.9 }
    });
  } else {
    (map.getSource('safe-route') as mapboxgl.GeoJSONSource).setData(geojson as any);
  }
};

const clearSafeRoute = (map: Map) => {
  if (map.getLayer('safe-route-line')) {
    map.removeLayer('safe-route-line');
  }
  if (map.getSource('safe-route')) {
    map.removeSource('safe-route');
  }
};

export default function CrowdHeatmap({ 
  highlightAlertLocation, 
  alertZone 
}: { 
  highlightAlertLocation?: [number, number]; 
  alertZone?: string; 
} = {}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [startZone, setStartZone] = useState(ZONE_DATA[0].name);
  const [endZone, setEndZone] = useState(ZONE_DATA[2].name);

  // Track component mount state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const showSafeRoute = () => {
    if (!mapRef.current) return;
    drawSafeRoute(mapRef.current, startZone, endZone);
    console.log(`Showing route from ${startZone} to ${endZone}`);
  };

  const clearRoute = () => {
    if (!mapRef.current) return;
    clearSafeRoute(mapRef.current);
  };

  const bounds = useMemo<LngLatBoundsLike>(() => {
    const pad = 0.0025;
    return [
      [CENTER[0] - pad, CENTER[1] - pad],
      [CENTER[0] + pad, CENTER[1] + pad]
    ];
  }, []);

  useEffect(() => {
    // Clean up any existing map first
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Wait for the container to be available
    if (!mapContainerRef.current) {
        setIsLoading(false);
        return;
      }

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!isMounted || !mapContainerRef.current) return;

      try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: CENTER,
        zoom: 17.8,
          minZoom: 16,
          maxZoom: 20,
        cooperativeGestures: true,
        attributionControl: true,
          maxBounds: bounds,
        pitch: 45,
        bearing: -12
        });
        mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
      map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }));

      map.on('load', () => {
        try {
            console.log('Map loaded successfully, drawing zones...');
          drawZones(map);
          drawCenter(map);
            
            // Handle alert location highlighting after map loads
            if (highlightAlertLocation && alertZone) {
              console.log('Adding alert location:', highlightAlertLocation, alertZone);
              handleAlertLocation(map, highlightAlertLocation, alertZone);
            }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Layer draw failed', e);
        } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        });

        // Handle map load errors
        map.on('error', (e) => {
          console.error('Map error:', e);
          if (isMounted) {
            setErrorMsg('Failed to load map. Please refresh the page.');
          setIsLoading(false);
        }
      });

    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Map init failed', e);
        if (isMounted) {
        setErrorMsg('Failed to load map. Please refresh the page.');
      setIsLoading(false);
        }
      }
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bounds, isMounted, retryCount]);

  // Handle alert location changes
  useEffect(() => {
    if (mapRef.current && highlightAlertLocation && alertZone) {
      handleAlertLocation(mapRef.current, highlightAlertLocation, alertZone);
    }
  }, [highlightAlertLocation, alertZone]);

  const handleAlertLocation = (map: Map, location: [number, number], zone: string) => {
    try {
      // Remove existing alert marker if any
      if (map.getSource('alert-location')) {
        map.removeLayer('alert-marker-outline');
        map.removeLayer('alert-marker');
        map.removeSource('alert-location');
      }

      // Add alert location marker
      const alertFeature = {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: location },
        properties: { name: zone, type: 'alert' }
      };

      map.addSource('alert-location', { 
        type: 'geojson', 
        data: { type: 'FeatureCollection', features: [alertFeature] } 
      });

      // Add alert marker layer
      map.addLayer({
        id: 'alert-marker',
        type: 'circle',
        source: 'alert-location',
        paint: {
          'circle-color': '#ef4444',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 8,
            20, 12
          ]
        }
      });

      // Add alert marker outline for pulsing effect
      map.addLayer({
        id: 'alert-marker-outline',
        type: 'circle',
        source: 'alert-location',
        paint: {
          'circle-color': 'rgba(239, 68, 68, 0.3)',
          'circle-stroke-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 12,
            20, 18
          ]
        }
      });

      // Fly to alert location
      map.flyTo({
        center: location,
        zoom: 18,
        duration: 2000,
        essential: true
      });

      // Add popup for alert location
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'alert-popup'
      })
      .setLngLat(location)
      .setHTML(`
        <div style="font-size:14px; text-align:center; padding:8px;">
          <div style="color:#ef4444; font-weight:bold; margin-bottom:4px;">
            🚨 ALERT LOCATION
          </div>
          <strong>${zone}</strong><br/>
          <span style="color:#666; font-size:12px;">Click to view details</span>
        </div>
      `)
      .addTo(map);

      // Auto-remove popup after 5 seconds
      setTimeout(() => {
        if (popup.isOpen()) {
          popup.remove();
        }
      }, 5000);

    } catch (error) {
      console.error('Error handling alert location:', error);
    }
  };

  const drawCenter = (map: Map) => {
    new Marker({ color: '#2563eb' }).setLngLat(CENTER).addTo(map);
  };

  const drawZones = (map: Map) => {
    const features = ZONE_DATA.map((z) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: z.coordinates },
      properties: z
    }));

    if (!map.getSource('zones')) {
      map.addSource('zones', { type: 'geojson', data: { type: 'FeatureCollection', features } });
    } else {
      (map.getSource('zones') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features } as any);
    }

    if (!map.getLayer('zones-heat')) {
      map.addLayer({
        id: 'zones-heat',
        type: 'heatmap',
        source: 'zones',
        maxzoom: 20,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'current'], 0, 0, 15000, 1],
          'heatmap-intensity': 0.8,
          'heatmap-radius': 30,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(16,185,129,0.35)',
            0.4, 'rgba(250,204,21,0.45)',
            0.7, 'rgba(245,158,11,0.6)',
            1, 'rgba(239,68,68,0.75)'
          ]
        }
    });
    }

    if (!map.getLayer('zones-points')) {
      map.addLayer({
        id: 'zones-points',
        type: 'circle',
        source: 'zones',
        paint: {
          'circle-color': ['case', ['!=', ['get', 'status'], 'normal'], '#ef4444', '#10b981'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-radius': 6
        }
      });
    }

    map.on('click', 'zones-points', (e) => {
      const f = (e.features as any)?.[0];
      if (!f) return;
      const p = f.properties as any;
      const coord = (f.geometry as any).coordinates.slice();
      const html = `
        <div style="font-size:13px">
          <strong>${p.name}</strong><br/>
          Capacity: ${Number(p.capacity).toLocaleString()}<br/>
          Current: ${Number(p.current).toLocaleString()}<br/>
          Status: ${String(p.status).toUpperCase()}
        </div>`;
      new mapboxgl.Popup({ offset: 12 }).setLngLat(coord as [number, number]).setHTML(html).addTo(map);
    });
  };

  const refreshData = () => {
    if (!mapRef.current) return;
    
    // Clear any existing routes
    clearSafeRoute(mapRef.current);
    
    // Clear alert highlighting
    if (mapRef.current.getSource('alert-location')) {
      mapRef.current.removeLayer('alert-marker-outline');
      mapRef.current.removeLayer('alert-marker');
      mapRef.current.removeSource('alert-location');
    }
    
    // Redraw zones
    drawZones(mapRef.current);
    
    // Re-add alert location if provided
    if (highlightAlertLocation && alertZone) {
      handleAlertLocation(mapRef.current, highlightAlertLocation, alertZone);
    }
    
    // Fly to center
    mapRef.current.flyTo({ center: CENTER, zoom: 17.8, essential: true });
    
    // Reset error state
    setErrorMsg(null);
  };

  const retryMapLoad = () => {
    setErrorMsg(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-pulse" />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Loading Campus Map...
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">Initializing Campus Surveillance...</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-pulse" />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Sandip University Campus (Mapbox)
              </span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Campus-only map with heatmap and warnings. Panning is limited to campus bounds.
            </CardDescription>
            {errorMsg && (
              <div className="text-xs sm:text-sm text-red-600 mt-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 animate-pulse" />
                {errorMsg}
                <Button size="sm" variant="outline" onClick={retryMapLoad} className="text-xs bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} className="text-xs sm:text-sm bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 transition-all duration-300 hover:scale-105">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
            Re-center & Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20 transition-all duration-300 hover:scale-105">
              <Users className="h-3 w-3 animate-pulse" />
              Total Capacity: {ZONE_DATA.reduce((sum, zone) => sum + zone.capacity, 0).toLocaleString()}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20 transition-all duration-300 hover:scale-105">
              <Activity className="h-3 w-3 animate-pulse" />
              Current Crowd: {ZONE_DATA.reduce((sum, zone) => sum + zone.current, 0).toLocaleString()}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/20 transition-all duration-300 hover:scale-105">
              <AlertTriangle className="h-3 w-3 text-yellow-500 animate-pulse" />
              Warnings: {ZONE_DATA.filter(z => z.status !== 'normal').length}
            </Badge>
          </div>

          {/* Route Recommendation Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3 p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                From:
              </label>
              <select
                value={startZone}
                onChange={(e) => setStartZone(e.target.value)}
                className="border rounded px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border-blue-500/30 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              >
                {ZONE_DATA.map(z => (
                  <option key={z.name} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            <span className="text-blue-600 text-xs sm:text-sm font-medium">to</span>

            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-purple-600 flex items-center gap-1">
                <Target className="h-3 w-3" />
                To:
              </label>
              <select
                value={endZone}
                onChange={(e) => setEndZone(e.target.value)}
                className="border rounded px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border-purple-500/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
              >
                {ZONE_DATA.map(z => (
                  <option key={z.name} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            <Button size="sm" onClick={showSafeRoute} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-lg">
              <Route className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Show Safe Route
            </Button>
            
            <Button size="sm" variant="outline" onClick={clearRoute} className="text-xs sm:text-sm bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20 transition-all duration-300 hover:scale-105">
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Clear Route
            </Button>
          </div>
          
          <div 
            ref={mapContainerRef}
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg border-2 border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>
      </CardContent>
    </Card>
  );
}