const jwt = require(`jsonwebtoken`);

// ФУНКЦИЯ ПО ПРОВЕРКЕ JWT ТОКЕНА
const authenticationToken = (req, res, next) => {
  const token = req.headers[`authorization`];

  if (!token) {
    return res.status(401).json({ error: `Пользователь не авторизован` });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: `Invalid Token` });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticationToken;
