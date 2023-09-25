import { useState } from "react";

export function useGeolocation(defaultPosition = null) {
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(defaultPosition);

  function getPosition() {
    if (!navigator.geolocation) {
      return setError("Your browser does not support geolocation");
    }

    navigator.geolocation.getCurrentPosition(
      (props) => {
        const { coords } = props;

        setPosition({
          lat: coords.latitude,
          lng: coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );
  }

  return {
    position,
    isLoading,
    error,
    getPosition,
  };
}
