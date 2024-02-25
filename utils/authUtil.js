const validator = require("validator");
const cleanupAndValidate = ({ name, email, username, password }) => {
  return new Promise((resolve, reject) => {
    if (!name || !email || !username || !password)
      reject("missing credentials");
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    )
      reject("Bad datatype");
    if (username.length < 4 || username.length > 30)
      reject("username length should be in the range 4-30");
    if (password.length < 4 || password.length > 30)
      reject("password length should be in the range 4-30");

    if (!validator.isEmail(email)) reject("Email format is wrong");
    resolve();
  });
};
module.exports = { cleanupAndValidate };
