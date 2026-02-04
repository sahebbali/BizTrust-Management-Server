const getCurrentPKT = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map = {};

  parts.forEach((p) => {
    if (p.type !== "literal") map[p.type] = p.value;
  });

  const date = `${map.year}-${map.month}-${map.day}`;
  const time = `${map.hour}:${map.minute}:${map.second}`;

  // PKT timestamp (correct)
  const pktTimestamp = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  return {
    date, // YYYY-MM-DD (PKT)
    time, // HH:mm:ss (PKT)
    pktTimestamp, // correct PKT timestamp
  };
};
function getFuture48HoursPKT() {
  const now = new Date();
  const future = new Date(now.getTime() + 48 * 60 * 60 * 1000); // add 48 hours

  // Format using PKT timezone safely
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(future);
  const map = {};
  parts.forEach((p) => {
    if (p.type !== "literal") map[p.type] = p.value;
  });

  const date = `${map.year}-${map.month}-${map.day}`; // YYYY-MM-DD
  const time = `${map.hour}:${map.minute}:${map.second}`; // HH:mm:ss

  // Correct PKT timestamp
  const pktTimestamp = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  return {
    date,
    time,
    pktTimestamp,
  };
}

function getStartEndDepositPKT(securityType) {
  const now = new Date();

  // 1️⃣ Start date: 48 hours from now
  const startDateObj = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // 2️⃣ End date based on securityType
  const endDateObj = new Date(startDateObj);
  if (securityType === "Equity Fund") {
    endDateObj.setMonth(endDateObj.getMonth() + 30); // 30 months
  } else {
    endDateObj.setMonth(endDateObj.getMonth() + 24); // 24 months
  }

  // Helper: format date/time & get PKT timestamp
  const formatPKT = (dateObj) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(dateObj);
    const map = {};
    parts.forEach((p) => {
      if (p.type !== "literal") map[p.type] = p.value;
    });

    const date = `${map.year}-${map.month}-${map.day}`; // YYYY-MM-DD
    const time = `${map.hour}:${map.minute}:${map.second}`; // HH:mm:ss
    const pktTimestamp = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );

    return { date, time, pktTimestamp };
  };

  return {
    start: formatPKT(startDateObj),
    end: formatPKT(endDateObj),
  };
}

module.exports = {
  getCurrentPKT,
  getFuture48HoursPKT,
  getStartEndDepositPKT,
};
