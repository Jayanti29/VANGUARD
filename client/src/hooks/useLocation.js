import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const useLocation = () => {
  const [location, setLocation] = useState({
    lat: 12.7244, // Default Ramanagara Latitude
    lng: 77.2911, // Default Ramanagara Longitude
    address: 'Ramanagara, Karnataka, India',
    state: 'Karnataka',
    district: 'Ramanagara',
    village: 'Ramanagara Town',
    ward: 'Ward 6',
    houseNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') {
      console.log("[Location Hook] Simulated reverse geocoding");
      // Simulate lat/lng check to return a mock address
      return {
        address: 'Ward 6, Ramanagara Rural, Karnataka, 562159',
        state: 'Karnataka',
        district: 'Ramanagara',
        village: 'Ramanagara Rural',
        ward: 'Ward 6'
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const components = result.address_components;
        
        let state = '';
        let district = '';
        let village = '';
        let ward = '';
        
        for (const c of components) {
          if (c.types.includes('administrative_area_level_1')) {
            state = c.long_name;
          }
          if (c.types.includes('administrative_area_level_2') || c.types.includes('locality')) {
            district = c.long_name;
          }
          if (c.types.includes('sublocality') || c.types.includes('neighborhood') || c.types.includes('sublocality_level_1')) {
            ward = c.long_name;
          }
          if (c.types.includes('premise') || c.types.includes('route')) {
            village = c.long_name;
          }
        }

        // Clean up or infer village/ward from sublocality
        if (!village) village = district || 'Local Town';
        if (!ward) ward = 'Ward 1';

        return {
          address: result.formatted_address,
          state,
          district,
          village,
          ward
        };
      }
      throw new Error(data.error_message || 'Reverse geocoding failed');
    } catch (err) {
      console.error("Geocoding failed, falling back to mock: ", err);
      return {
        address: 'Ward 6, Ramanagara, Karnataka',
        state: 'Karnataka',
        district: 'Ramanagara',
        village: 'Ramanagara',
        ward: 'Ward 6'
      };
    }
  };

  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser';
        setError(err);
        reject(err);
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const geoInfo = await reverseGeocode(lat, lng);
            const newLoc = {
              lat,
              lng,
              ...geoInfo,
              houseNo: ''
            };
            setLocation(newLoc);
            setLoading(false);
            resolve(newLoc);
          } catch (err) {
            setLoading(false);
            reject(err);
          }
        },
        (err) => {
          console.warn("Geolocation permission denied, using Ramanagara default:", err);
          setError('Location access denied. Please fill in location manually.');
          setLoading(false);
          // Don't crash, resolve default
          resolve(location);
        },
        { timeout: 10000 }
      );
    });
  };

  return {
    location,
    setLocation,
    loading,
    error,
    detectLocation,
    reverseGeocode
  };
};

export default useLocation;
