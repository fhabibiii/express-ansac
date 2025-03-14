//import express
const express = require('express')
const path = require('path')

//import CORS
const cors = require('cors')

//import bodyParser
const bodyParser = require('body-parser')

//import router
const router = require('./routes')

//init app
const app = express()

// Update your CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow your frontend origin or all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

//use body parser
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Serve static files from the 'public' folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

//define port
const port = 3000;

//route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

//define routes
app.use('/api', router);

//start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})