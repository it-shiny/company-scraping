const axios = require("axios");
const cheerio = require("cheerio");
const faker = require("faker");

const generateStrongPassword = (length = 20) => {
  if (length < 8) {
    throw new Error("Password length must be at least 8 characters");
  }

  const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numericChars = "0123456789";
  const specialChars = "!@#$%&*()-+=^.";
  const allChars =
    lowerCaseChars + upperCaseChars + numericChars + specialChars;

  let password = [
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)],
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)],
    numericChars[Math.floor(Math.random() * numericChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password array and convert to a string
  password = password.sort(() => Math.random() - 0.5).join("");

  return password;
};

const reachstreamAuthApp = async () => {
  var headers,
    firstName,
    lastName,
    password,
    phoneNumber,
    email,
    token,
    order_id;

  let cookies = {};
  const generateUserInfo = () => {
    firstName = faker.name.firstName().replace(/[^a-zA-Z0-9]/g, "");
    lastName = faker.name.lastName().replace(/[^a-zA-Z0-9]/g, "");
    password = generateStrongPassword();
    phoneNumber = null;
  };

  const reachStreamHeaders = {
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    //   "Content-Length": 142,
    "Content-Type": "application/json",
    Origin: "https://app.reachstream.com",
    Referer: "https://app.reachstream.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  const setCookie = (headers) => {
    let resCookies = headers["set-cookie"];
    cookies["XSRF-TOKEN"] = resCookies.filter((c) =>
      c.startsWith("XSRF-TOKEN=")
    )[0];
    cookies["tenemail"] = resCookies.filter((c) => c.startsWith("tenemail="))[0]
      ? resCookies.filter((c) => c.startsWith("tenemail="))[0]
      : cookies["tenemail"];
    cookies["temp_minutemail_session"] = resCookies.filter((c) =>
      c.startsWith("temp_minutemail_session=")
    )[0];
  };

  const getTemporaryEmail = async () => {
    const minuteinboxUrl =
      "https://temp-mailbox.com/10minutemail/messages?" + new Date().getTime();
    try {
      var response;
      while (true) {
        response = await axios.post(minuteinboxUrl);
        if (!response.data.mailbox.endsWith("@page.edu.pl")) {
          break;
        }
        console.log("Invalid temporary email generated. Trying again...");
      }
      console.log(
        "Ten minutes email successfully generated!  ",
        response.data.mailbox
      );
      setCookie(response.headers);
      return response.data.mailbox;
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const registerTemporaryUser = async (email) => {
    const tempRegisterUrl =
      "https://api-prd.reachstream.com/api/AAA/v1/auth/temp-register";
    const tempRegisterPayload = {
      firstName: "Brad",
      lastName: "D",
      email: email,
      userRole: "customer",
      phoneNumber: null,
      packageId: 2128,
    };
    try {
      const response = await axios.post(tempRegisterUrl, tempRegisterPayload, {
        headers: reachStreamHeaders,
      });
      console.log("Reachstream temp-register successfully!");
      console.log(response.data);
      // await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const getVerificationCode = async () => {
    const emailVerificationUrl =
      "https://temp-mailbox.com/10minutemail/messages?" + new Date().getTime();
    let attemptCount = 0;

    const pollVerificationCode = async () => {
      try {
        // tempEmailHeader.Cookie = `${cookies['XSRF-TOKEN']}; ${cookies.email}; ${cookies.temp_minutemail_session}`;
        const response = await axios.post(
          emailVerificationUrl,
          {},
          {
            headers: {
              Cookie: `${cookies["XSRF-TOKEN"]}; ${cookies["tenemail"]}; ${cookies["temp_minutemail_session"]}`,
            },
          }
        );

        setCookie(response.headers);
        // Check if the response is valid (adjust the condition as needed)
        if (
          response.data.messages.length > 0 &&
          response.data.messages[0].content.startsWith("<!doctype html>")
        ) {
          const $ = cheerio.load(response.data.messages[0].content);
          return $("h2").text();
        } else {
          // If not valid, retry after 500ms
          attemptCount++;
          0;
          if (attemptCount < 50) {
            console.log("Retrying in 500ms...");
            await new Promise((resolve) => setTimeout(resolve, 500));
            return pollVerificationCode();
          } else {
            throw new Error(
              "Max attempts reached. Could not get verification code."
            );
          }
        }
      } catch (error) {
        console.error(error.message || error);
        throw error;
      }
    };

    return pollVerificationCode();
  };

  const activateTemporaryRegistration = async (email, verificationCode) => {
    const activeTempRegisterUrl =
      "https://api-prd.reachstream.com/api/AAA/v1/auth/active-temp-register";
    const activeTempRegisterPayload = {
      code: verificationCode,
      email: email,
    };
    try {
      await axios.post(activeTempRegisterUrl, activeTempRegisterPayload);
      console.log("Verification succeed!");
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const registerUserWithDetails = async (email) => {
    const registerUrl =
      "https://api-prd.reachstream.com/api/AAA/v1/auth/register";

    const registerPayload = {
      firstName,
      lastName,
      email: email,
      password,
      confirmPassword: password,
      userRole: "customer",
      phoneNumber: null,
      packageId: 2128,
      agreement: "true",
    };
    try {
      const response = await axios.post(registerUrl, registerPayload);
      token = JSON.parse(response.data.data);
      console.log("Reachstream registered succesfullly!");
      console.log("----------------------------------------------");
      console.log("name: ", firstName + " " + lastName);
      console.log("email: ", email);
      console.log("token: ", response.data.data);
      console.log("password: ", password);

      return {
        email,
        password: registerPayload.password,
        token,
      };
    } catch (error) {
      if (error.response) console.log(error.response.data);
      console.error(error.message || error);
      throw error;
    }
  };

  const loginUser = async () => {
    const loginUrl = "https://api-prd.reachstream.com/api/AAA/v1/auth/login";

    const loginPayload = {
      email,
      password,
    };
    try {
      const response = await axios.post(loginUrl, loginPayload);
      token = JSON.parse(response.data.data);

      console.log("Reachstream login succesfullly!");
      console.log("----------------------------------------------");
      console.log("name: ", firstName + " " + lastName);
      console.log("email: ", email);
      console.log("token: ", response.data.data);
      console.log("password: ", password);

      return {
        email,
        password: password,
        token,
      };
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const createOrder = async () => {
    const url = "https://api-prd.reachstream.com/api/Pricing/v1/orders/create";
    const payload = {
      email_id: email,
      package_id: 2128,
      token,
    };
    try {
      const response = await axios.post(url, payload, {
        headers: { ...reachStreamHeaders, Authorization: "Bearer " + token },
      });

      order_id = JSON.parse(response.data.data).orderId;

      console.log("Order successfully");
    } catch (error) {
      if (error.response) console.log(error.response.data);
      console.error(error.message || error);
      throw error;
    }
  };

  const createPlan = async () => {
    const url = "https://api-prd.reachstream.com/api/AAA/v1/user/plan/create";
    const payload = {
      user_plan_name: "freemium",
      order_id: order_id,
      status: "active",
      total_assigned_credit: "25",
      total_balance_credit: "25",
      total_assigned_contact_view: "100",
      total_balance_contact_view: "100",
      token: token,
    };

    try {
      await axios.post(url, payload, {
        headers: { ...reachStreamHeaders, Authorization: "Bearer " + token },
      });

      console.log("Plan successfully");
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const activeCredit = async () => {
    const url =
      "https://api-prd.reachstream.com/api/AAA/v1/user/plan/active/credit";
    const payload = {};

    try {
      await axios.post(url, payload, {
        headers: { ...reachStreamHeaders, Authorization: "Bearer " + token },
      });

      console.log("Active credit successfully");
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  try {
    generateUserInfo();
    // const emailFetchHeaders = await generateEmailFetchHeaders();
    email = await getTemporaryEmail();
    await registerTemporaryUser(email);
    const verificationCode = await getVerificationCode();
    await activateTemporaryRegistration(email, verificationCode);
    const userData = await registerUserWithDetails(email);

    await createOrder();
    await createPlan();
    await activeCredit();

    return [userData, loginUser];
  } catch (error) {
    console.error(error.message || error);
    console.error("[[[[[[[[[[[[[[error.message || error]]]]]]]]]]]]]]");
    throw error;
  }
};

module.exports = reachstreamAuthApp;
