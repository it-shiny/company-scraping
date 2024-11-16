const axios = require("axios");
const cheerio = require("cheerio");
const faker = require("faker");
let tempEmailHeader = {
    ':authority': '10minutemail.one',
    ':method': 'POST',
    ':path': '/messages?1703189351039',
    ':scheme': 'https',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Length': '56',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': '',
    'Origin': 'https://10minutemail.one',
    'Referer': 'https://10minutemail.one/',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest'
};

const emailVerificationUrl =
  "https://10minutemail.one/messages?" + new Date().getTime();
const getAPI = async () => {
  const response = await axios.post(emailVerificationUrl, {}, {
    headers: {
      'Cookie': `XSRF-TOKEN=eyJpdiI6IlZNdFc2SGN2VzV5RmhyOWg5cjRLN3c9PSIsInZhbHVlIjoieHVqaFQ4bllvMm1VS0RlWm5IMzJCUUpvS1lmZUhrSWVKeWhXQVRpNnlFR1JyMGlQR0UzbDdsZWJsV0hzN2t5dWdpa20vOFMrU3kxdWtxYURqQ3Q4VC9ibEdQanhMUlZ2VTNqbGdwTkxEWU93ZFg4YlZ0Q2IvcmVPVnNlbnhRSzUiLCJtYWMiOiIzMGZmMWExMzU5MjMwMjc0MzhmZDA3YWRmZWU5MTIwZDQ3NTVlZDdiNmI2ZjA2NDAxOGMyNzRkYmQzMTY5N2JhIn0%3D; email=eyJpdiI6IkNTOHpFeXRGWmdGWk9sZi9qdkFHanc9PSIsInZhbHVlIjoiR0kyWHBXbVhTcWNtRXZFSko0K1ZTUy9JMEtaK2VHMkdLUzM5V1lTZmlxaWV1VnFwR2ZxN0J3OWZCMUp2T0lNdGZZVHdLMzBnVkJSaVVFRWVnVlJ2TUE9PSIsIm1hYyI6Ijc2YzRjNTBhM2Q5Nzg2NDAyYjE2YWZiMWNmZWJjYjY0MDZjZDU1Mzk4ZjE5NWRmODZkNDkxMjdiNjdkODBiMjYifQ%3D%3D; minutemail_session=eyJpdiI6IkRrQksxRmFwVy9aSXI1TEdxYXBIV2c9PSIsInZhbHVlIjoicEVPb0pWb3MxMEFiWlN1Mi9zeXJjR1J0MG5TV3M4Y1ZyS1dYWEY2d3VUeWhMcWs2dU5lNW5TdVkwT3owWitWNDhxclJEaVRrcVlySlA2NnJhM0MyK0NUbGxGZHVDaHI5bHA3NUdVTHEwc2x4YVhMdGlXbUhEc3BCTjhBcThXMFciLCJtYWMiOiJjZTRkYTJkYTIyN2U3MWY0NDI1N2Q1NGVkMDBjMmI5ODVmZmQ5Zjc1OWM0NDU4ZThiYzZjNTE1ZDQ4NGQyNDU4In0%3D`,
      ':authority': '10minutemail.one',
      ':method': 'POST',
      ':path': '/messages?1703189351039',
      ':scheme': 'https',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Length': '56',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://10minutemail.one',
      'Referer': 'https://10minutemail.one/',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    },
  });
  console.log(response.headers["set-cookie"]);
};
getAPI();