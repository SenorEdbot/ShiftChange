const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const epilogue = require('epilogue')
const OktaJwtVerifier = require('@okta/jwt-verifier')

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: '0oahrgmwhaF9AYr610h7',
  issuer: 'https://dev-822122.oktapreview.com/oauth2/default'
})

let app = express()
app.use(cors())
app.use(bodyParser.json())

// verify JWT token middleware
app.use((req, res, next) => {
  // require every request to have an authorization header
  if (!req.headers.authorization) {
    return next(new Error('Authorization header is required'))
  }
  let parts = req.headers.authorization.trim().split(' ')
  let accessToken = parts.pop()
  oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
      req.user = {
        uid: jwt.claims.uid,
        email: jwt.claims.sub
      }
      next()
    })
    .catch(next) // jwt did not verify!
})

// For ease of this tutorial, we are going to use SQLite to limit dependencies
let database = new Sequelize({
  username: "root",
  password: "edbot",
  database: "shiftChange_db",
  host: "127.0.0.1",
  dialect: "mysql"
})

const DataTypes = Sequelize.DataTypes;
// Define our Post model
// id, createdAt, and updatedAt are added by sequelize automatically
let Posts = database.define('Shifts', {
  name: DataTypes.STRING,
  reason: DataTypes.STRING,
  date: DataTypes.DATE,
  duration: DataTypes.DECIMAL,
  role: DataTypes.STRING,
  covered: DataTypes.BOOLEAN,
  priority: DataTypes.STRING,
  personResponsible: DataTypes.STRING
});

// Initialize epilogue
epilogue.initialize({
  app: app,
  sequelize: database
})

// Create the dynamic REST resource for our Post model
let userResource = epilogue.resource({
  model: Posts,
  endpoints: ['/posts', '/posts/:id']
})

// Resets the database and launches the express app on :8081
database
  .sync({ force: true })
  .then(() => {
    app.listen(8081, () => {
      console.log('listening to port localhost:8081')
    })
  })


