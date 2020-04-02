'use strict'

const express = require('express')
const sirv = require("sirv")
// const bodyParser = require('body-parser');

// const app = express()

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.use(express.static('export'))

const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`)
// })
express()
  .use(
    // compression({ threshold: 0 }),
    sirv("export"),
    // sapper.middleware()
  )
  .listen(PORT);
