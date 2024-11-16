const { SearchParam, Token } = require("../models/token");
const reachstreamAuthApp = require("./generateToken");

// Function to add a completed page number
const addCompletedPage = async (documentId, pageNumber) => {
  const scrapingDocument = await SearchParam.findById(documentId);
  if (scrapingDocument) {
    scrapingDocument.completedPages.push(pageNumber);
    scrapingDocument.currentPage = pageNumber;
    scrapingDocument.params = {...scrapingDocument.params, page: pageNumber }
    return await scrapingDocument.save();
  } else {
    return false;
    // Handle the case where the document doesn't exist
  }
};

// Function to get a current Params
const getCurrentSearchParam = async () => {
  try {
    // Fetch the latest search parameters
    const latestSearchParam = await SearchParam.findOne().sort({
      createdAt: -1,
    });
    return latestSearchParam ? latestSearchParam : null;
  } catch (error) {
    console.error("Error fetching latest search parameters:", error);
    throw error; // Or handle the error as needed
  }
};

const createToken = async () => {
  try {
    const [userData] = await reachstreamAuthApp();
    let newToken = {
      token: userData.token,
      email: userData.email,
      password: userData.password,
    };
    const savedToken = await new Token(newToken).save();
    return savedToken;
  } catch (error) {
    console.log("Error fetching generate token:", error);
    return createToken()
  }
};

const getValidToken = async () => {
  try {
    const validTokens = await Token.find({ status: "valid" }).sort({
      createdAt: 1,
    });
    if (validTokens.length == 0) {
      for (let i = 0 ; i<4; i++) {
        createToken();
      }
      const validToken = await createToken();
      return validToken;
    } else {
      return validTokens[0]
    } 
  } catch(error) {
    console.log(`Retrying getValidToken. Attempt again`, error);
  }
};

const isEnoughtToken = async () => {
  const validTokens = await Token.find({ status: "valid" });
  return validTokens.length >= 5 ? true : false;
};

module.exports = {
  addCompletedPage,
  getCurrentSearchParam,
  getValidToken,
  isEnoughtToken,
};
