import './App.css';
import {useState, useEffect} from 'react';
import axios from 'axios'

const Filter = ({filter, onFilterChange}) => {
  return (
    <>
      found countries <input type="text" value={filter} onChange={onFilterChange}/>
    </>
  )
}

const TooMany = () => {
  return (
    <p>Too many matches, specify another filter</p>
  )
}

const CountryList = ({countries, onShow}) => {
  return (
    <div>
      {
        countries.map((c, i) => (
        <div key={i}>
          {c.name.common} <button onClick={onShow(c)}>show</button>
        </div>
      ))
    }
    </div>
  )
}

// const fahrenheidToCelsius = (x) => {
//   return (x - 32) * 5 / 9;
// }

const BasicData = ({country, weather}) => {
  return (
    <div>
      <h2>{country.name.common}</h2>
      capital {country.capital}<br/>
      area {country.area}<br/>
      <h3>languages:</h3>
      <ul>
        {
          Object.getOwnPropertyNames(country.languages).map(
            (p, i) => <li key={i}>{country.languages[p]}</li>
          )
        }
      </ul>
      <div>
        <img width="180px" src={country.flags.svg} alt={`flag of ${country.name.common}`}/>
      </div>
      <h3>Weather in {country.capital}</h3>
      {
        weather == null
        ? "loading..."
        :
        <>
        <div>
          temperature {weather.main.temp}° Celsius
        </div>
        <div>
          <img src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Wetter Icon" />
        </div>
        <div>
          wind {weather.wind.speed} m/s
        </div>
        </>
      }

    </div>
  )
}

const EmptyList = () => {
  return (
    <div>
      No country found
    </div>
  )
}

const App = () => {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState('');
  const [shown, setShown] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [weather, setWeather] = useState(null);
  // was not sure if maybe the query in the country service should be used,
  // or if the complete country list should be loaded once at the start and then
  // all filtering/querying only be done internally.
  // The first option would probably go beyond this exercise and would probably
  // occupy the country service more than necessary.
  // So we go by the second option, load all countries at the beginning in an array
  // and then work with that array only.
  useEffect(() => {
    const hasCanceled = {
      canceled: false
    }
    const abortController = new AbortController();
    axios.get("https://restcountries.com/v3.1/all", {
      signal: abortController.signal
    })
    .then(response => {
      if (hasCanceled.canceled) {
        console.log("return because canceled");
        return;
      }
      console.log("not canceled");
      setCountries(response.data);
    })
    .catch(error => {
      if (hasCanceled.canceled) {
        console.log("return from catch because canceled");
        return;
      }
      console.error("axios.get failed", error);
    })


    console.log("getting countries...");

    return () => {
      console.log("canceling");
      hasCanceled.canceled = true;
      abortController.abort();
    }
  }, [])

  useEffect(() => {
    if (shown == null) return;
    const hasCanceled = {canceled: false}
    const abortController = new AbortController();
    const lat = shown.capitalInfo.latlng[0];
    const lon = shown.capitalInfo.latlng[1];
    const api_key = process.env.REACT_APP_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    console.log("weather url", url);

    axios.get(url, {
      signal: abortController.signal
    })
    .then(response => {
      console.log("weather reponse data", response.data);
      setWeather(response.data);
    })
    .catch(error => {
      if (hasCanceled.canceled) {
        console.log("weather: return from catch because canceled");
        return;
      }
      console.error("weather: axios.get failed", error);
    })

    return () => {
      console.log("canceling weather");
      hasCanceled.canceled = true;
      abortController.abort();
    }
  }, [shown])

  const onFilterChange = (event) => {
    const newFilter = event.target.value;
    setFilter(newFilter);
    const newFiltered = countries.filter(c => {
      return c.name.common.toLowerCase().includes(newFilter.toLowerCase());
    });
    setFiltered(newFiltered);
    setShown(newFiltered.length === 1 ? newFiltered[0] : null);
  }

  // const filtered = countries.filter(c => {
  //   console.log(c);
  //   return c.name.common.toLowerCase().includes(filter.toLowerCase());
  // });

  const onShow = (country) => () => {
    setShown(country);
  }

  console.log("in rendering: shown=", shown);

  return (
    <div>
      <Filter filter={filter} onFilterChange={onFilterChange}/>
      {
        shown == null && filtered.length > 10
        ? <TooMany/>
        : shown == null && filtered.length > 1
        ? <CountryList countries={filtered} onShow={onShow}/>
        : shown != null || filtered.length === 1
        ? <BasicData country={shown ? shown : filtered[0]} weather={weather} />
        : <EmptyList/>
      }
    </div>
  );
}

export default App;
