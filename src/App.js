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
  const [cryptoName, setCryptoName] = useState('');
  const [cryptoData, setCryptoData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [cryptos] = useState([
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'ripple', name: 'XRP' },
    { id: 'dogecoin', name: 'Dogecoin' },
  ]);
  const [currencies] = useState([
    { id: 'usd', name: 'USD' },
    { id: 'pln', name: 'PLN' },
    { id: 'eur', name: 'EUR' },
    { id: 'gbp', name: 'GBP' },
  ]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  
  // Funkcja do pobierania danych o kryptowalucie
  const fetchCryptoData = async (id, currency) => {
    try {
      setLoading(true);
      setError(null);

      // Pobieramy dane podstawowe o kryptowalucie
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
      if (response.status !== 200) {
        throw new Error('Błąd pobierania danych');
      }

      setCryptoData(response.data);

      // Pobieramy dane o wykresie 7-dniowym
      const chartResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
        params: {
          vs_currency: currency,
          days: '7',
        },
      });

      const prices = chartResponse.data.prices;
      const labels = prices.map((price) => new Date(price[0]).toLocaleDateString());
      const data = prices.map((price) => price[1]);

      setChartData({
        labels,
        datasets: [
          {
            label: `Cena ${id.charAt(0).toUpperCase() + id.slice(1)} (${currency.toUpperCase()})`,
            data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
          },
        ],
      });
    } catch (err) {
      setError('Błąd podczas pobierania danych. Sprawdź poprawność nazwy kryptowaluty.');
      setCryptoData(null);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Obsługuje zmianę tekstu w polu wyszukiwania
  const handleInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setCryptoName(query);

    if (query === '') {
      setFilteredCryptos(cryptos);
    } else {
      const filtered = cryptos.filter((crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.id.toLowerCase().includes(query)
      );
      setFilteredCryptos(filtered);
    }
  };

  // Obsługuje kliknięcie na kryptowalutę z listy
  const handleSearch = (id) => {
    const selectedCurrency = currencies[0].id; // Domyślnie wybieramy USD, ale można to zmienić
    fetchCryptoData(id, selectedCurrency);
    setCryptoName('');
    setIsDropdownVisible(false);
  };

  const handleInputClick = () => {
    setIsDropdownVisible(!isDropdownVisible); // Zmieniamy widoczność dropdownu
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kryptowaluty - Ceny w USD</h1>
      </header>

      {/* Pole wyszukiwania kryptowaluty */}
      <div className="search-container">
        <input
          type="text"
          value={cryptoName}
          onClick={handleInputClick}
          onChange={handleInputChange}
          placeholder="Wpisz nazwę kryptowaluty (np. Bitcoin, Ethereum)"
          className="search-input"
        />
        {isDropdownVisible && (
          <div className="dropdown">
            <ul className="suggestions-list">
              {filteredCryptos.length > 0
                ? filteredCryptos.map((crypto) => (
                    <li key={crypto.id} onClick={() => handleSearch(crypto.id)}>
                      {crypto.name} ({crypto.id.toUpperCase()})
                    </li>
                  ))
                : cryptos.map((crypto) => (
                    <li key={crypto.id} onClick={() => handleSearch(crypto.id)}>
                      {crypto.name} ({crypto.id.toUpperCase()})
                    </li>
                  ))}
            </ul>
          </div>
        )}
      </div>

      {/* Wyświetlanie błędów */}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Wyświetlanie ładowania */}
      {loading && <p className="loading-text">Ładowanie danych...</p>}

      {/* Wyświetlanie wykresu 7-dniowego dla kryptowaluty */}
      {chartData && !loading && !error && (
        <div className="chart-container">
          <h2>{cryptoName.charAt(0).toUpperCase() + cryptoName.slice(1)}</h2>
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
}

export default App;
