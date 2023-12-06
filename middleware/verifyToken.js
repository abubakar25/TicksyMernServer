const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const JWT_SECRET = process.env.SECRET_KEY;
  const token = req.headers.authorization;

  //   console.log(token, "token");

  const newToken = token.split(" ")[1];

  //   console.log(newToken, "newToken");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(newToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
