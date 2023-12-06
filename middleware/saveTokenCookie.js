// Create token and Saving in cookie

const sendToken = async (user, req, res) => {
  //   console.log(user);
  const token = await user.generateAuthtoken();
  //   console.log(token, "abubakar-Token");
  //   options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("abubakarCookieToken", token, options);
};

module.exports = sendToken;
