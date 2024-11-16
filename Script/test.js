const reachstreamAuthApp = require("./index.js");

const main = async () => {
  const [userData, loginUser] = await reachstreamAuthApp();
  console.log(userData);
};

main();
