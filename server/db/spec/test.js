var query = require('./queries.js');

var testUser = {
  "username": "justin3",
  "password": 1234,
  "offer": ["angular", "mmeatloaf", "dodgeball"],
  "want": ["js", "bakingg cookies", "wheat toast"],
  "email": "justin.thareja@gmail.com"
};

query.createUser(JSON.stringify(testUser));

