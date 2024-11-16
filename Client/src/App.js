import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchParamsManager from "./SearchParamasManager";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [token, setToken] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [progress, setProgress] = useState({});
  const [isScrapingStarted, setIsScrapingStarted] = useState(false);
  const apiURL = process.env.REACT_APP_API_URL;

  // const handleRegisterToken = async () => {
  //   try {
  //     const response = await axios.post(`${apiURL}/registerToken`, { token });
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error("Error registering token:", error);
  //   }
  // };

  const handleStartScraping = async () => {
    try {
      setIsScrapingStarted(true);
      const response = await axios.post(`${apiURL}/startScraping`, {
        token,
        searchParams: JSON.parse(searchParams),
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error starting scraping:", error);
      setIsScrapingStarted(false); // Reset state if scraping failed to start
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tokensResponse = await axios.get(`${apiURL}/getCurrentTokens`);
        const searchParamsResponse = await axios.get(
          `${apiURL}/getCurrentSearchParams`
        );

        setToken(tokensResponse.data.join("\n")); // Assuming tokens are an array
        setSearchParams(JSON.stringify(searchParamsResponse.data, null, 2)); // Format JSON for display
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [apiURL]);

  // useEffect(() => {
  //   const fetchScrapingProgress = async () => {
  //     try {
  //       const response = await axios.get(`${apiURL}/scrapingProgress`);
  //       setProgress(response.data);
  //     } catch (error) {
  //       console.error("Error fetching scraping progress:", error);
  //     }
  //   };

  //   let interval;
  //   if (isScrapingStarted) {
  //     interval = setInterval(fetchScrapingProgress, 1000);
  //   }
  //   return () => clearInterval(interval);
  // }, [isScrapingStarted, apiURL]);

  return (
    <div className="container p-5">
      {/* <div className="mb-3">
        <label htmlFor="tokenInput" className="form-label">
          Token
        </label>
        <textarea
          className="form-control"
          id="tokenInput"
          rows="3"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        ></textarea>
        <button className="btn btn-primary mt-2" onClick={handleRegisterToken}>
          Register Token
        </button>
      </div> */}
      <h1>Get Data</h1>
      <div className="mb-3">
        <label htmlFor="searchParamsInput" className="form-label">
          Search Parameters (JSON)
        </label>
        <div>
          <SearchParamsManager
            apiURL={apiURL}
          />
        </div>
        {/* <button className="btn btn-primary mt-2" onClick={handleStartScraping}>
          Start Scraping
        </button> */}
      </div>
      {/* {isScrapingStarted && (
        <div>
          <p>Scraping Progress:</p>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${(progress.currentPage / progress.totalPages) * 100}%`,
              }}
            ></div>
          </div>
          {progress.errors && (
            <p className="text-danger">Error: {progress.errors.join(", ")}</p>
          )}
        </div>
      )} */}
    </div>
  );
}

export default App;
