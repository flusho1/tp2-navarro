import { useState } from "react";
import { Box, Container, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

const API_WEATHER = `https://api.openweathermap.org/data/2.5/weather?appid=${import.meta.env.VITE_API_KEY}&units=metric&q=`;

// Objeto de traducción de condiciones meteorológicas
const weatherConditions = {
  Clear: "Despejado",
  Clouds: "Nublado",
  Rain: "Lluvia",
  Drizzle: "Llovizna",
  Thunderstorm: "Tormenta",
  Snow: "Nieve",
  Mist: "Niebla",
  Smoke: "Humo",
  Haze: "Neblina",
  Dust: "Polvo",
  Fog: "Niebla",
  Sand: "Arena",
  Ash: "Ceniza",
  Squall: "Chubasco",
  Tornado: "Tornado",
};

// Objeto de mensajes
const mensajes = {
  obligatorio: "Campo obligatorio",
  errorClima: "Error al obtener datos del clima",
  buscando: "Cargando...",
};

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [weatherData, setWeatherData] = useState(null);
  const [historial, setHistorial] = useState([]);

  const buscarClima = async (cityName) => {
    setLoading(true);
    setError({
      error: false,
      message: "",
    });

    try {
      if (!cityName.trim()) {
        throw new Error(mensajes.obligatorio);
      }

      const response = await fetch(`${API_WEATHER}${cityName}`);
      const data = await response.json();

      if (response.ok) {
        const weatherInfo = {
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          condition: traducirCondicion(data.weather[0].main), // Utilizar traducción de condición
          icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
          conditionText: data.weather[0].description,
          date: new Date().toISOString(),
        };

        setWeatherData(weatherInfo);
        setHistorial([...historial, weatherInfo]);

        await guardarBusqueda(weatherInfo);
      } else {
        throw new Error(data.message || mensajes.errorClima);
      }
    } catch (error) {
      setError({
        error: true,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const guardarBusqueda = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP! Status: ${response.status}`);
      }

      const savedSearch = await response.json();
      console.log("Búsqueda guardada:", savedSearch);
    } catch (error) {
      console.error("Error al guardar búsqueda:", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await buscarClima(city);
    setCity("");
  };

  // Función para traducir la condición meteorológica
  const traducirCondicion = (condition) => {
    return weatherConditions[condition] || condition; // Devuelve la traducción o la condición original si no encuentra traducción
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        TP2 App Clima
      </Typography>
      <Box
        sx={{ display: "grid", gap: 2 }}
        component="form"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <TextField
          id="city"
          label="Ciudad"
          variant="outlined"
          size="small"
          required
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={error.error}
          helperText={error.message}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          loadingIndicator={mensajes.buscando}
        >
          Buscar
        </LoadingButton>
      </Box>

      {weatherData && (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h2">
            {weatherData.city}, {weatherData.country}
          </Typography>
          <Box
            component="img"
            alt={weatherData.conditionText}
            src={weatherData.icon}
            sx={{ margin: "0 auto" }}
          />
          <Typography variant="h5" component="h3">
            {weatherData.temp} °C
          </Typography>
          <Typography variant="h6" component="h4">
            {weatherData.condition}
          </Typography>
        </Box>
      )}
      <Typography textAlign="center" sx={{ mt: 2, fontSize: "10px" }}>
        Powered by:{" "}
        <a
          href="https://openweathermap.org"
          title="OpenWeatherMap API"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenWeatherMap API
        </a>
      </Typography>
    </Container>
  );
}
