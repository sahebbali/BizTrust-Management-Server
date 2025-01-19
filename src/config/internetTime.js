const axios = require("axios");
const moment = require("moment");

const getIstInternetTime = async () => {
  try {
    const response = await axios.get(
      "http://worldtimeapi.org/api/timezone/Asia/Kolkata"
    );

    if (response && response.data && response.data.datetime) {
      const internetTimeStr = response.data.datetime;
      const internetTime = moment(internetTimeStr).utcOffset("+05:30");
      const istTime = internetTime.format("hh:mm:ss A");
      const istDate = internetTime.format("YYYY-MM-DD");

      return {
        time: istTime,
        date: istDate,
      };
    } else {
      console.error("Invalid response from WorldTimeAPI");
      return null;
    }
  } catch (error) {
    console.error(`Error fetching internet time: ${error.message}`);
    return null;
  }
};

const getInternetTime = async () => {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip");
    const internetTimeStr = response.data.utc_datetime;
    const internetTime = moment(internetTimeStr);
    return internetTime;
  } catch (error) {
    // console.error(`Error fetching internet time: ${error.message}`);
    return null;
  }
};

const getIstTimeWithInternet = async () => {
  const internetTime = await getInternetTime();

  if (internetTime) {
    const istTime = internetTime.clone().utcOffset("+05:30");
    return {
      time: istTime.format("hh:mm:ss A"),
      date: istTime.format("YYYY-MM-DD"),
    };
  } else {
    // console.error("Failed to fetch internet time. Cannot determine IST time.");
    return null;
  }
};

module.exports = { getIstTimeWithInternet, getIstInternetTime };
