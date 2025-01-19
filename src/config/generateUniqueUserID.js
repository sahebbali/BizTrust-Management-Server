function generateRandomNumericString(length) {
  const characters = "0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

function generateUniqueUserID() {
  const userIDLength = 6;
  return generateRandomNumericString(userIDLength);
}

module.exports = generateUniqueUserID;
