import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

// Rejestracja komponentów Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [cryptos, setCryptos] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin'); // Domyślnie Bitcoin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista dostępnych kryptowalut
  const cryptoList = ['bitcoin', 'ethereum', 'ripple', 'litecoin'];

  // Pobieranie danych o kryptowalutach
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: cryptoList.join(','), // Pobierz wszystkie kryptowaluty na raz
          },
        });
        setCryptos(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Pobieranie danych o cenach 7-dniowych dla wybranej kryptowaluty
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: '7',  // 7 dni
          },
        });
        const prices = response.data.prices;
        const labels = prices.map((price) => new Date(price[0]).toLocaleDateString());  // Daty
        const data = prices.map((price) => price[1]);  // Ceny

        // Ustawienie danych do wykresu
        setChartData({
          labels,
          datasets: [
            {
              label: `Cena ${selectedCrypto.charAt(0).toUpperCase() + selectedCrypto.slice(1)} (USD)`,
              data,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
          ],
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchChartData();
  }, [selectedCrypto]); // Zaktualizuj wykres, gdy zmieni się wybrana kryptowaluta

  // Obsługa zmiany wyboru kryptowaluty
  const handleCryptoChange = (event) => {
    setSelectedCrypto(event.target.value);
  };

  return (
    <div className="App">
      <h1>Kryptowaluty - Ceny w USD</h1>

      {loading && <p>Ładowanie danych...</p>}
      {error && <p>Błąd: {error}</p>}

      {/* Formularz wyboru kryptowaluty */}
      <label htmlFor="cryptoSelect">Wybierz kryptowalutę: </label>
      <select id="cryptoSelect" value={selectedCrypto} onChange={handleCryptoChange}>
        {cryptoList.map((crypto) => (
          <option key={crypto} value={crypto}>
            {crypto.charAt(0).toUpperCase() + crypto.slice(1)}
          </option>
        ))}
      </select>

      {/* Tabela z kryptowalutami */}
      <table>
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Cena (USD)</th>
            <th>Zmiana 24h (%)</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((crypto) => (
            <tr key={crypto.id}>
              <td>{crypto.name}</td>
              <td>{crypto.current_price.toFixed(2)}</td>
              <td style={{ color: crypto.price_change_percentage_24h > 0 ? 'green' : 'red' }}>
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Wykres 7-dniowy dla wybranej kryptowaluty */}
      {chartData ? (
        <div>
          <h2>Wykres 7-dniowy - {selectedCrypto.charAt(0).toUpperCase() + selectedCrypto.slice(1)}</h2>
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      ) : (
        <p>Ładowanie wykresu...</p>
      )}
    </div>
  );
}

export default App;
