"use client";

import React, { useRef } from "react";
import { GoogleMap, useLoadScript, HeatmapLayer } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

interface GoogleMapComponentProps {
  apiKey: string;
  orders: Array<{
    latitude: number | null;
    longitude: number | null;
  }>;
}

export const GoogleHeatMapComponent: React.FC<GoogleMapComponentProps> = ({
  apiKey,
  orders,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["visualization"], // Necessário para o HeatmapLayer
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  if (loadError)
    return (
      <div className="text-red-500">
        Erro ao carregar o mapa. Verifique a API Key.
      </div>
    );

  if (!isLoaded) return <Skeleton className="h-[300px]" />;

  // Filtra pedidos e substitui valores nulos por coordenadas padrão
  const validOrders = orders
    .filter((order) => order.latitude !== null && order.longitude !== null)
    .map((order) => ({
      location: new google.maps.LatLng(
        order.latitude ?? -27.176304,
        order.longitude ?? -49.628765
      ),
      weight: 1, // Peso opcional
    }));

  // Define o centro do mapa de forma segura
  const defaultCenter = { lat: -27.176304, lng: -49.628765 };
  const mapCenter =
    validOrders.length > 0
      ? {
          lat: validOrders[0].location.lat(),
          lng: validOrders[0].location.lng(),
        }
      : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={mapCenter}
      onLoad={(map) => {
        mapRef.current = map;
      }}>
      {validOrders.length > 0 && (
        <HeatmapLayer
          data={validOrders.map((item) => item.location)}
          options={{
            radius: 20,
            opacity: 0.6,
          }}
        />
      )}
    </GoogleMap>
  );
};
