// config environment variables
require('dotenv').config();
const {PORT} = process.env;

// load api dependencies - server/middleware
const express = require('express');
const cors = require('cors');

const app = express(); // express instance

// setup api middleware and routes
app.use(cors()); // access resources on the backend
app.use(express.json()); // parse incoming requests with JSON body
app.use(express.static('public')); // serve static files/images 

// start express server
app.listen(PORT, ()=> {
    console.log("BrainFlex 🚀🚀🚀");
});
