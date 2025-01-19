const { v4: uuid_v4 } = require('uuid');

const generateRandomString =()=> {
    let result = uuid_v4();

    return result.trim();
}

module.exports = generateRandomString;