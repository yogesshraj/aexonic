const genpass = require("generate-password");

module.exports.generate_password = () => {
  var password = "x";
  while (!has_digit(password)) {
    password = genpass.generate({
      length: 10,
      numbers: true,
      lowercase: true,
      uppercase: true,
      symbols: false,
    });
  }
  return password;
};


function has_digit(temp_str) {
  return /\d/.test(temp_str);
}

module.exports.is_empty = (input) =>{
  if(input == "" || input == null || input == undefined){
    return true;
  };
  return false;
}