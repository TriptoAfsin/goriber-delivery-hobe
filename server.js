require("dotenv").config();

const express = require('express')
const app = express()

//importing web routes
const initWebRoutes = require('./routes/web');
//importing api controller
const apiController = require('./controllers/apiController');

//port
const port = process.env.PORT


//init web routes
initWebRoutes(app);


app.listen(port, () => {
    console.log(`🔵 Listening on Port: ${port}`)
})