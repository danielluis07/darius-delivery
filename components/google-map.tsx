import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

interface GoogleMapComponentProps {
  apiKey: string;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  radiusKmList: number[];
}

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  apiKey,
  setLatitude,
  setLongitude,
  radiusKmList,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState({
    lat: -23.55052,
    lng: -46.633308,
  });

  // Use navigator.geolocation to get the user's current position (only if markerPosition is still the default)
  useEffect(() => {
    if (
      markerPosition.lat === -23.55052 &&
      markerPosition.lng === -46.633308 &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setLatitude(latitude);
          setLongitude(longitude);
        },
        () => {
          console.warn(
            "Geolocation permission denied. Using default location."
          );
        }
      );
    }
  }, [markerPosition, setLatitude, setLongitude]);

  // Handle map clicks and update state only if the position changes
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat() ?? 0;
      const lng = e.latLng?.lng() ?? 0;

      if (lat !== markerPosition.lat || lng !== markerPosition.lng) {
        setMarkerPosition({ lat, lng });
        setLatitude(lat);
        setLongitude(lng);
      }
    },
    [markerPosition, setLatitude, setLongitude]
  );

  if (loadError)
    return (
      <div className="text-red-500">
        Erro ao carregar o mapa. Verifique a API Key.
      </div>
    );
  if (!isLoaded) return <Skeleton className="h-[300px]" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={markerPosition}
      zoom={12}
      onClick={handleMapClick}
      onLoad={(map) => {
        mapRef.current = map;
      }}>
      <Marker position={markerPosition} />
      {/* Render a Circle for each distance in radiusKmList */}
      {radiusKmList.map((radius, index) => (
        <Circle
          key={index}
          center={markerPosition}
          radius={radius * 1000}
          options={{
            fillOpacity: 0,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  );
};
