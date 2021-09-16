const express = require('express');

const apiController = require('../controllers/apiController');



let router = express.Router();

let initWebRoutes = (app) => {

    //get routes
    router.get("/", apiController.apiIntro);
    router.get("/products", apiController.products); //public route
    router.get("/products/:id", apiController.filterProducts); //public route to filter by warehouses
    router.get("/search", apiController.searchProducts); //public route to search
    //router.get("/add-products", apiController.addProducts);

    router.get("/admin", apiController.admin); //admin route but public
    router.get("/admin/:id", apiController.updateProductState); //admin route requires admin key(given in email)

    router.get("/init", apiController.dataInit); //admin route requires admin key(given in email)

    router.get("/checkout", apiController.checkout); //public route
    router.get("/checkout/:id", apiController.buyProducts); //user route requires user key(given in email)

    //404 route
    router.get("*", apiController.notFound);

    return app.use("/", router);
}


module.exports = initWebRoutes;