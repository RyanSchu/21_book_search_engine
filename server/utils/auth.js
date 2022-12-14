const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({req, res}) {
    // allows token to be sent via  req.query or headers
    // console.log(req)
    let token = req.body.token || req.query.token || req.headers.authorization || {};
    // ["Bearer", "<tokenvalue>"]
    // console.log('req',req)
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }
 
    if (!token) {
      return res.status(400).json({ message: 'You have no token!' });
    }
    // console.log(token)
    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch(e) {
      console.error(e);
    }

    // send to next endpoint
    return req
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
