const jwt = require('jsonwebtoken');
const SECRET = 'your_jwt_secret'; // Use env variable in production

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if(!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};
