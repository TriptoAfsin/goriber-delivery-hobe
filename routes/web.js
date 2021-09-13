const express = require('express');

const apiController = require('../controllers/apiController');



let router = express.Router();

let initWebRoutes = (app) => {

    //get routes
    router.get("/", apiController.apiIntro);
    router.get("/products", apiController.products);
    router.get("/add-products", apiController.addProducts);
    router.get("/admin", apiController.admin);
    router.get("/init", apiController.dataInit);
    router.get("/checkout", apiController.admin);


    return app.use("/", router);
}


module.exports = initWebRoutes;