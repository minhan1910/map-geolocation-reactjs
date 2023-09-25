/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useReducer } from "react";
import { useEffect } from "react";
import { createContext } from "react";

const API_URL = `http://localhost:8000`;

export const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };
    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error("Unknown action type");
  }
}

const setLoading = () => ({
  type: "loading",
});

const setCities = (payload) => ({
  type: "cities/loaded",
  payload,
});

const setError = (payload) => ({
  type: "rejected",
  payload,
});

const setCurrentCity = (payload) => ({
  type: "city/loaded",
  payload,
});

const createNewCity = (payload) => ({
  type: "city/created",
  payload,
});

const deleteCityAction = (payload) => ({
  type: "city/deleted",
  payload,
});

export function CitiesProvider({ children }) {
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      try {
        dispatch(setLoading());
        const res = await fetch(`${API_URL}/cities`);

        if (!res.ok) {
          throw new Error("HTTP Error");
        }

        const data = await res.json();

        dispatch(setCities(data));
      } catch (error) {
        dispatch(setError("There was an error loading data..."));
        // alert("There was an error loading data...");
      }
    }

    fetchCities();
  }, []);

  async function getCity(id) {
    if (Number(id) === currentCity.id) {
      return;
    }

    try {
      dispatch(setLoading());
      const res = await fetch(`${API_URL}/cities/${id}`);

      if (!res.ok) {
        throw new Error("HTTP Error");
      }

      const data = await res.json();

      dispatch(setCurrentCity(data));
    } catch (error) {
      dispatch(setError("There was an error loading data..."));
    }
  }

  async function createCity(newCity) {
    try {
      dispatch(setLoading());

      const res = await fetch(`${API_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("HTTP Error");
      }

      const data = await res.json();

      // can fix by using React Query for updating the data
      // setCities((cities) => [...cities, data]);
      dispatch(createNewCity(data));
    } catch (error) {
      dispatch(setError("There was an error loading data..."));
    }
  }

  async function deleteCity(id) {
    try {
      dispatch(setLoading());
      const res = await fetch(`${API_URL}/cities/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("HTTP Error");
      }

      const data = await res.json();

      // can fix by using React Query for updating the data
      // setCities((cities) => cities.filter((city) => city.id !== id));
      dispatch(deleteCityAction(id));
    } catch (error) {
      const errorMsg = error.message ?? "There was an error loading data...";
      dispatch(setError(errorMsg));
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,  
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

export function useCities() {
  const context = useContext(CitiesContext);

  if (context === undefined) {
    throw new Error(
      "Error! CitiesContext using the outside of the CitiesProvider"
    );
  }

  return context;
}
