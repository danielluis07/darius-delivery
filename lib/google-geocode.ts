export const formatAddress = ({
  street,
  street_number,
  neighborhood,
  city,
  state,
  postalCode,
}: {
  street: string;
  street_number: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode: string;
}) => {
  return `${street} ${street_number}, ${
    neighborhood ? neighborhood + ", " : ""
  }${city} - ${state}, ${postalCode}, Brasil`;
};

export const getGeoCode = async (address: string, apiKey: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
  const res = await fetch(url);

  const data = await res.json();

  if (!res.ok) {
    console.error(data);
    return {
      success: false,
      message: "Erro ao cadastrar endereço",
    };
  }

  return {
    success: true,
    latitude: data.results[0].geometry.location.lat,
    longitude: data.results[0].geometry.location.lng,
    placeId: data.results[0].place_id,
  };
};
