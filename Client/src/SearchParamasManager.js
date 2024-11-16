import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const SearchParamsManager = ({ apiURL }) => {
  const [searchParamsList, setSearchParamsList] = useState([]);
  const [newParamName, setNewParamName] = useState("");
  const [newParamValue, setNewParamValue] = useState("");
  const [selectedParam, setSelectedParam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [progress, setProgress] = useState({}); // Store progress by param name

  const fetchSearchParams = async () => {
    try {
      const response = await axios.get(
        `${apiURL}/search-params?page=${currentPage}&pageSize=5`
      );
      setSearchParamsList(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching search parameters:", error);
    }
  };
  useEffect(() => {
    fetchSearchParams();
  }, [apiURL, currentPage]);

  const addNewParam = async () => {
    try {
      const newParam = {
        name: newParamName,
        params: JSON.parse(newParamValue),
      };
      const response = await axios.post(`${apiURL}/setSearchParams`, newParam);
      setSearchParamsList([...searchParamsList, response.data]); // Update with the response from the server
      setNewParamName("");
      setNewParamValue("");
      console.log(searchParamsList);
    } catch (error) {
      console.error("Error adding new parameter:", error);
    }
  };

  const deleteParam = async (paramId) => {
    try {
      await axios.delete(`${apiURL}/delete-search-param/${paramId}`); // Make the API call to delete the param
      fetchSearchParams();
    } catch (error) {
      console.error("Error deleting search parameter:", error);
    }
  };

  const onScrapeStart = async (paramId) => {
    try {
      const response = await axios.post(`${apiURL}/startScraping`, {
        paramId,
      });
      return response.data;
    } catch (error) {
      console.error("Error starting scraping:", error);
    }
  };

  const updateProgress = async (paramId) => {
    setInterval(async () => {
    const response = await axios.get(`${apiURL}/getCurrentSearchParams?paramId=${paramId}`);
    let currentState = response.data;
      setProgress((prevProgress) => ({
        ...prevProgress,
        [paramId]: {
          ...prevProgress[paramId],
          progress:
            (currentState.currentPage /
              (currentState.params.totalCount /
              currentState.params.pageSize)) *
            100,
            totalPages: currentState.params.totalCount / currentState.params.pageSize,
            currentPage: currentState.currentPage
        },
      }));
    }, 500);
  };
  const startScraping = async (paramId) => {
    const res = await onScrapeStart(paramId);
    setProgress((prevProgress) => ({
      ...prevProgress,
      [paramId]: {
        ...prevProgress[paramId],
        status: "In Progress",
      },
    }));
  };

  const renderJsonData = (param) => (
    <pre className="bg-light w-50 p-2" style={{ height: "200px" }}>
      <code>{JSON.stringify(param.params, null, 2)}</code>
    </pre>
  );

  const renderPagination = () => {
    let items = [];
    let leftSide = currentPage - 2;
    if (leftSide <= 0) leftSide = 1;
    let rightSide = currentPage + 2;
    if (rightSide > totalPages) rightSide = totalPages;

    for (let number = leftSide; number <= rightSide; number++) {
      items.push(
        <button
          key={number}
          onClick={() => setCurrentPage(number)}
          disabled={currentPage === number}
          className={`page-item ${currentPage === number ? "active" : ""}`}
        >
          {number}
        </button>
      );
    }

    const prevDisabled = currentPage === 1;
    const nextDisabled = currentPage === totalPages;

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={prevDisabled}
        >
          &lt;
        </button>
        {leftSide > 1 && <button onClick={() => setCurrentPage(1)}>1</button>}
        {leftSide > 2 && <span>...</span>}
        {items}
        {rightSide < totalPages - 1 && <span>...</span>}
        {rightSide < totalPages && (
          <button onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </button>
        )}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={nextDisabled}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="container my-4">
      <div className="row mb-2">
        <div className="col">
          <h2>Search Parameters</h2>
        </div>
      </div>

      {searchParamsList.length > 0 ? (
        <div className="row">
          <div className="col">
            <ul className="list-group">
              {searchParamsList.map((param, index) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={index}
                >
                  {renderJsonData(param)}
                  <div className="list w-50">
                    <div className="row">
                      <div className="col-12 w-100 text-center">
                        <h3>{param.name}</h3>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 d-flex justify-content-between align-items-center flex-column">
                        <button
                          className="btn btn-primary btn-sm m-3"
                          onClick={() => startScraping(param._id)}
                          disabled={
                            progress[param._id]?.status == "In Progress"
                          }
                        >
                          {progress[param._id]?.status == "In Progress"
                            ? progress[param._id]?.status
                            : "Start Scraping"}
                        </button>
                        <button
                          className="btn btn-primary btn-sm m-3"
                          onClick={() => updateProgress(param._id)}
                          disabled={
                            progress[param._id]?.status == "In Progress"
                          }
                        >
                          Show Status
                        </button>
                        <button
                          className="btn btn-danger btn-sm m-3"
                          onClick={() => deleteParam(param._id)}
                        >
                          Delete
                        </button>
                        <div style={{ width: "80%" }}>
                          <div className="progress m-3">
                            <div
                              className="progress-bar progress-bar-striped progress-bar-animated"
                              role="progressbar"
                              aria-valuenow={progress[param._id]?.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{
                                width: `${progress[param._id]?.progress || 0}%`,
                              }}
                            >{progress[param._id]?.currentPage} / {progress[param._id]?.totalPages}</div>
                          </div>
                        </div>
                        {/* <div className="progress" style={{ width: "80%" }}>
                          <div
                            className="progress-bar m-3"
                            role="progressbar"
                            style={{
                              width: `${progress[param._id]?.progress || 0}%`,
                            }}
                          ></div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">No search parameters added.</div>
      )}

      {renderPagination()}

      <div className="row">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control mb-2"
            value={newParamName}
            onChange={(e) => setNewParamName(e.target.value)}
            placeholder="Parameter Name"
          />
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control mb-2"
            value={newParamValue}
            onChange={(e) => setNewParamValue(e.target.value)}
            placeholder="Parameter Value"
          />
        </div>
      </div>

      <div className="row">
        <div className="col">
          <button
            className="btn btn-success"
            onClick={addNewParam}
            disabled={!newParamName || !newParamValue}
          >
            Add Parameter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchParamsManager;
