const axios = require("axios");
const Contact = require("../models/Contact");
const { Token, SearchParam } = require("../models/token");
const { addCompletedPage, getValidToken } = require("./searchController");

const getHeaders = (token) => ({
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  // other headers...
  "Content-Type": "application/json",
  Origin: "https://app.reachstream.com",
  Referer: "https://app.reachstream.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Authorization: "Bearer " + token,
});

const API_ENDPOINTS = {
  fetchRecords:
    "https://api-prd.reachstream.com/api/Search/v1/records/single/fetch",
  filterRecords:
    "https://api-prd.reachstream.com/api/Search/v1/records/filters",
  totalCountRecords:
    "https://api-prd.reachstream.com/api/Search/v1/records/search-pattern/count",
};

let currentPage = 1;
const pageSize = 10;

// const searchParams = {
//   page: currentPage,
//   pageSize: pageSize,
//   searchPattern: {
//     company_address_country: {},
//     company_address_state: {},
//     company_address_city: {},
//     company_address_zipcode: {},
//     contact_job_title_1: {},
//     contact_job_title_level_1: {},
//     contact_job_dept_name_1: {},
//     contact_job_function_name_1: {},
//     company_industry_categories_list: {
//       0: "Software Development",
//     },
//     sic_code: {},
//     company_employee_size: {},
//     company_annual_revenue_amount: {},
//     company_tech_keywords_list: {},
//     company_company_name: {},
//     searchBy: "contact",
//   },
// };

const isInvalidToken = (error) => {
  return error.response && error.response.status === 400; // Check for invalid token response
};

const markTokenAsExpired = async (token) => {
  await Token.findOneAndUpdate({ token }, { status: "expired" });
};

const getTotalCount = async (tokenData, params) => {
  try {
    if (!tokenData) {
      tokenData = await getValidToken();
      if (!tokenData) {
        throw new Error("No valid token available.");
      }
    }
    const headers = getHeaders(tokenData.token);
    const response = await axios.post(API_ENDPOINTS.totalCountRecords, params, {
      headers,
    });
    if (response.status === 200) {
      return JSON.parse(response.data.data);
    } else {
      throw new Error("Failed to fetch contact ID list");
    }
  } catch (error) {
    console.error("Error in getTotalCount:", error.message);
    throw error;
  }
};

const getContactIDList = async (token, page, currentSearchParam) => {
  try {
    const headers = getHeaders(token);
    const modifiedSearchParams = { ...currentSearchParam, page }; // Add the page to the search params
    console.log("API", API_ENDPOINTS.filterRecords);
    console.log("modified", modifiedSearchParams);
    const response = await axios.post(
      API_ENDPOINTS.filterRecords,
      modifiedSearchParams,
      { headers }
    );
    if (response.status === 200) {
      return JSON.parse(response.data.data).records;
    } else {
      throw new Error("Failed to fetch contact ID list");
    }
  } catch (error) {
    console.error("Error in getContactIDList:", error.message);
    throw error;
  }
};

const fetchAndSaveContacts = async (token, currentSearchParam) => {
  if (!token) {
    const tokenData = await getValidToken();
    token = tokenData.token;
    if (!token) {
      throw new Error("No valid token available.");
    }
  }
  let allContactsFetched = false;
  currentPage = currentSearchParam.currentPage
    ? currentSearchParam.currentPage
    : currentPage;
  while (!allContactsFetched) {
    try {
      console.log("PREV", currentSearchParam);
      const contactIDs = await getContactIDList(
        token,
        currentPage,
        currentSearchParam.params
      );
      if (contactIDs.length === 0) {
        allContactsFetched = true;
        break; // Exit the loop if no more contacts are returned
      }

      const headers = getHeaders(token);
      const fetchContactsPromises = contactIDs.map((contact) =>
        axios.post(
          API_ENDPOINTS.fetchRecords,
          { id: contact.id, action: "view" },
          { headers }
        )
      );

      const responses = await Promise.all(fetchContactsPromises);
      const contacts = responses
        .filter((response) => response.data.status === 200)
        .map((response) => JSON.parse(response.data.data)[0])
        .filter((contact) => contact);

      await Contact.insertMany(contacts);
      currentSearchParam = await addCompletedPage(
        currentSearchParam._id,
        currentPage
      );
      console.log(`Data saved for page ${currentSearchParam.currentPage}`);
      currentPage++; // Increment the page number for the next iteration
    } catch (error) {
      console.error(
        "Error in fetchAndSaveContacts on page " + currentPage + ": ",
        error.message
      );
      if (isInvalidToken(error)) {
        await markTokenAsExpired(token);
        let newTokenData = await getValidToken();
        const searchParams = await SearchParam.findOne({
          _id: currentSearchParam._id,
        })
          .sort({ createdAt: -1 })
          .lean();
        searchParams.currentPage++;
        await fetchAndSaveContacts(newTokenData.token, searchParams); // Retry with next token, keeping the current page
      }
      return; // Exit the function if an error occurs
    }
  }
  console.log("All data fetched and saved successfully");
};

const registerToken = async (token) => {
  const newToken = new Token({ token });
  await newToken.save();
};

module.exports = {
  registerToken,
  fetchAndSaveContacts,
  markTokenAsExpired,
  getTotalCount,
};
