const axios = require("axios");
const cheerio = require("cheerio");
const faker = require("faker");

const reachstreamAuthApp = async () => {
  var headers,
    firstName,
    lastName,
    password,
    phoneNumber,
    email,
    token,
    order_id;

  let tempEmailHeader = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': '',
    'Origin': 'https://10minutemail.one',
    'Referer': 'https://10minutemail.one/'
};

let cookies = {}
  const generateUserInfo = () => {
    firstName = faker.name.firstName();
    lastName = faker.name.lastName();
    password = "123qwe!@#QWE";
    phoneNumber = faker.datatype
      .number({ min: 1000000000, max: 9999999999 })
      .toString();
  };

  const generateCodeFetchHeaders = async () => ({
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    Connection: "keep-alive",
    Cookie: headers["set-cookie"],
    Host: "www.minuteinbox.com",
    Referer: "https://www.minuteinbox.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
  });

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
    let resCookies = headers['set-cookie']
    cookies['XSRF-TOKEN'] = resCookies.filter(c=> c.startsWith('XSRF-TOKEN='))[0];
    cookies.email = resCookies.filter(c=> c.startsWith('email='))[0] ? resCookies.filter(c=> c.startsWith('email='))[0] : cookies.email;
    cookies.minutemail_session = resCookies.filter(c=> c.startsWith('minutemail_session='))[0];
  }

  const getTemporaryEmail = async () => {
    const minuteinboxUrl =
      "https://10minutemail.one/messages?" + new Date().getTime();
    try {
      const response = await axios.post(minuteinboxUrl);
      console.log("Ten minutes email successfully generated!  ", response.data);
      setCookie(response.headers)
      return response.data.mailbox;
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const registerTemporaryUser = async (email) => {
    const tempRegisterUrl =
      "https://aaa-prd.reachstream.com/v1/auth/temp-register";
    const tempRegisterPayload = {
      firstName: "Brad",
      lastName: "D",
      email: email,
      userRole: "customer",
      phoneNumber: "1203948484",
      packageId: 2128,
    };
    try {
      const response = await axios.post(tempRegisterUrl, tempRegisterPayload, {
        headers: reachStreamHeaders,
      });
      console.log("Reachstream temp-register successfully!");
      // await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    } catch (error) {
      console.error(error.message || error);
      throw error;
    }
  };

  const getVerificationCode = async () => {
    const emailVerificationUrl =
      "https://10minutemail.one/messages?" + new Date().getTime();
    let attemptCount = 0;

    const pollVerificationCode = async () => {
      try {
        // tempEmailHeader.Cookie = `${cookies['XSRF-TOKEN']}; ${cookies.email}; ${cookies.minutemail_session}`;
        const response = await axios.post(emailVerificationUrl, {}, {
          headers: { 'Cookie': `${cookies['XSRF-TOKEN']}; ${cookies.email}; ${cookies.minutemail_session}` }
        });
        setCookie(response.headers);
        // Check if the response is valid (adjust the condition as needed)
        console.log(response.data)
        if (
          response.data.messages.length > 0 &&
          response.data.messages[0].content.startsWith("<!DOCTYPE html>")
        ) {
          const $ = cheerio.load(response.data.messages[0].content);
          return $("h2").text();
        } else {
          // If not valid, retry after 500ms
          attemptCount++;
          if (attemptCount < 1000) {
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
      "https://aaa-prd.reachstream.com/v1/auth/active-temp-register";
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
      phoneNumber: phoneNumber,
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
    console.log("PAYLOAD", payload);
    console.log("HEADER", {
      ...reachStreamHeaders,
      Authorization: "Bearer " + token,
    });

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
  }
};
// reachstreamAuthApp();
module.exports = reachstreamAuthApp;
