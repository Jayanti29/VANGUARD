import { useState, useEffect } from 'react';

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
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      
      const displayName = data.display_name || 'Ramanagara, Karnataka, India';
      const addressObj = data.address || {};
      
      const state = addressObj.state || 'Karnataka';
      const district = addressObj.county || addressObj.district || 'Ramanagara';
      const village = addressObj.village || addressObj.town || addressObj.city || 'Ramanagara Town';
      const ward = addressObj.suburb || addressObj.neighbourhood || 'Ward 6';

      return {
        address: displayName,
        state,
        district,
        village,
        ward
      };
    } catch (err) {
      console.error("Geocoding failed: ", err);
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
