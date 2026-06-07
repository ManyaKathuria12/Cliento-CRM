const bcrypt = require("bcryptjs");

bcrypt.hash("Admin12345", 10).then((hash) => {
  console.log(hash);
});