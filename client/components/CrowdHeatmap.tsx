import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';
import type { Map, LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

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
  ] as [number, number][]
};

const FALLBACK_TOKEN = 'pk.eyJ1Ijoicm91bmFrMDEiLCJhIjoiY21lbWE1YjE0MG9vOTJqcXZuN2FldTRmeCJ9.4jn-C-5Rg836aWsCs52Oew';
const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN || FALLBACK_TOKEN;
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

export default function CrowdHeatmap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [startZone, setStartZone] = useState(ZONE_DATA[0].name);
  const [endZone, setEndZone] = useState(ZONE_DATA[2].name);

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
    if (!mapContainerRef.current || mapRef.current) {
        setIsLoading(false);
        return;
      }

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
          drawZones(map);
          drawCenter(map);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Layer draw failed', e);
        } finally {
          setIsLoading(false);
        }
      });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Map init failed', e);
        setErrorMsg('Failed to load map. Please refresh the page.');
      setIsLoading(false);
      }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bounds]);

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
    drawZones(mapRef.current);
    mapRef.current.flyTo({ center: CENTER, zoom: 17.8, essential: true });
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Loading Campus Map...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sandip University Campus (Mapbox)
            </CardTitle>
            <CardDescription>
              Campus-only map with heatmap and warnings. Panning is limited to campus bounds.
            </CardDescription>
            {errorMsg && (
              <div className="text-sm text-red-600 mt-2">{errorMsg}</div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-center & Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Total Capacity: {ZONE_DATA.reduce((sum, zone) => sum + zone.capacity, 0).toLocaleString()}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Current Crowd: {ZONE_DATA.reduce((sum, zone) => sum + zone.current, 0).toLocaleString()}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Warnings: {ZONE_DATA.filter(z => z.status !== 'normal').length}
            </Badge>
          </div>

          {/* Route Recommendation Controls */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <select
                value={startZone}
                onChange={(e) => setStartZone(e.target.value)}
                className="border rounded px-3 py-1 text-sm bg-white"
              >
                {ZONE_DATA.map(z => (
                  <option key={z.name} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            <span className="text-gray-600">to</span>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">To:</label>
              <select
                value={endZone}
                onChange={(e) => setEndZone(e.target.value)}
                className="border rounded px-3 py-1 text-sm bg-white"
              >
                {ZONE_DATA.map(z => (
                  <option key={z.name} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            <Button size="sm" onClick={showSafeRoute} className="bg-blue-600 hover:bg-blue-700">
              Show Safe Route
            </Button>
            
            <Button size="sm" variant="outline" onClick={clearRoute}>
              Clear Route
            </Button>
          </div>
          
          <div 
            ref={mapContainerRef}
            className="w-full h-[500px] rounded-lg border shadow-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}