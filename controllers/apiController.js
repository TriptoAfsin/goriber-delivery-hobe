require("dotenv").config();
const mySql = require('mysql')
const fs = require('fs')
const validators = require('is-it-dash')

//mock Datas
let rawData = fs.readFileSync('./controllers/mockData.json')
let wareHouses = JSON.parse(rawData);


//sql queries
let SQL = {
    createProductsTable: "CREATE TABLE products(id int AUTO_INCREMENT, prod_name VARCHAR(255), selling_price float(24), description VARCHAR(65535),inventory int,in_stock VARCHAR(255),prod_origin VARCHAR(255),FULLTEXT(prod_name),PRIMARY KEY (id))",
    getProducts: "SELECT * FROM products",
    insertProducts: "INSERT INTO products SET ?",
    getTableNames: "SELECT table_name FROM information_schema.tables WHERE table_type = 'base table'",
    checkEmptyTable: "SELECT EXISTS (SELECT 1 FROM products)"
}


let apiStatus = {
    endPoints: [
        "/products",
        "/products/:warehouse_name",
        "/search/'Search Query'",
        "/checkout",
        "/admin",
        "/admin/:id?inStock='yes'&inventory=50&adminKey=YourKey",
      ],
    DB_Connection_Status: false
}

//API Intro Page
let apiIntro = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json(apiStatus);
}
//utility functions
//word includes
let wordIncludes = (wordsToMatch, wordsFound) => {
    return wordsToMatch.some(word => wordsFound.toLowerCase().includes(word)); //received_message is an object
}

let emptyTableDetector = () => {

}


//connecting to db
let dbConfig = {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_USER_PASS,
    database: process.env.DB_NAME
}

let db = mySql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        return console.error("🔴 Error occurred while connecting to DB")
    }
    apiStatus.DB_Connection_Status = true
    console.log("🟢 Connected to DB")
    productsTableCreator()
});



//initial DB configs
let productsTableCreator = () => {
    let emptyTableVerdict
    //checks if products table is already present or not
    db.query(SQL.getTableNames, (err, result) => {
        if (err) {
            return console.error("🔴 Error occurred while getting table names")
        }
        for (let i = 0; i < result.length; i++) {
            if (result[i].table_name === "products") {
                return console.log(`🔵 Found Products Table`)
            }
        }
        console.log("🟡 Products Table Was Not Found, trying to create products table")

        //when products table is not found, tries to create a products table 
        db.query(SQL.createProductsTable, (err, result) => {
            if (err) {
                console.log(err)
                return console.error("🔴 Error occurred while creating products table")
            }
            return console.log(`🟢 Products table was created`)
        })

    })

    //checking if products table is empty or not
    console.log(`🟡 Checking if Products table is empty or not`)
    db.query(SQL.checkEmptyTable, (err, result) => {
        if (err) {
            console.log(err)
            return console.error("🔴 Error while checking empty table")
        }

        emptyTableVerdict = result[0][Object.keys(result[0])[0]]

        if(emptyTableVerdict === 1){
            return console.log(`🟡 Products Table isn't empty`)
        }
        return console.log(`🟢 Products Table is empty`)
    })

    //checks for warehouses
    db.query(SQL.getTableNames, (err, result) => {
        if (err) {
            return console.error("🔴 Error occurred while getting warehouse names")
        }
        for (let i = 0; i < result.length; i++) {
            if (wordIncludes(["warehouse"], result[i].table_name)) {
                console.log("🔵 Found Warehouses Table")
                if(emptyTableVerdict === 0){
                    try {
                        return InsertWareHousesToProducts()
                    } catch (err) {
                        return console.log("🔴 Error while inserting to products")
                    }
                }
                return
            }
        }
        return console.log("🟡 Didn't find any warehouses table, try initializing the project first")
    })
}

// Inserting Ware Houses data to products table
let InsertWareHousesToProducts = () => {
    let allWareHouses = []
    //getting all warehouse table names
    for (let i = 0; i < wareHouses.length; i++) {
        allWareHouses.push(wareHouses[i].name)
    }

    for (let i = 0; i < allWareHouses.length; i++) {
        let sql = `SELECT products FROM ${allWareHouses[i]}`

        db.query(sql, (err, selectedProductsColumn) => {
            if (err) {
                console.log(err)
                return console.error("🔴 Error while selecting products")
            }
            console.log(`🟢 Successfully selected products column of warehouse ${allWareHouses[i]}`)

            

            //getting all the products of a warehouse and inserting in the warehouseProducts array
            let warehouseProducts = []
            warehouseProducts.push({selectedProductsColumn})

            let wareHouseProdObj = JSON.parse(warehouseProducts[0].selectedProductsColumn[0].products)

            
            for(let k =0 ;k <3; k++){
                let structuredProd = {
                    prod_name: wareHouseProdObj[k].name,
                    selling_price: wareHouseProdObj[k].selling_price,
                    description: wareHouseProdObj[k].description,
                    inventory: wareHouseProdObj[k].inventory,
                    in_stock: wareHouseProdObj[k].inStock,
                    prod_origin: allWareHouses[i]
                }
                db.query(SQL.insertProducts, structuredProd, (err, result) => {
                    if (err) {
                        console.log(err)
                        return console.error("🔴 Products insertion failed")
                    }
                    return console.log(`🟢 Products insertion was successful`)
                })
            }
            console.log(`🟠 Total Product Inserted from ${allWareHouses[i]}: ${wareHouseProdObj.length}`)
        })
    }
}


let dataInit = (req, res) => {

    if(!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY){
        return res.status(401).json(
            {
                "Error": "Unauthorized Access !"
            }
        ) 
    }

    let isWarehouseTableSuccess = true
    let isWarehouseDataSuccess = true
    let isProductsTableDataTransfer = true

    //creating warehouse table
    try{
        wareHouseTableCreator()
    }catch(err){
        isWarehouseTableSuccess = false
    }

    //inserting warehouse table data
    try{
        InsertWareHouseData()
    }catch(err){
        isWarehouseDataSuccess = false
    }

    try{
        InsertWareHousesToProducts()
    }catch(err){
        isProductsTableDataTransfer = false
    }
    
    
    return res.status(200).json(
        {
            "Warehouse Table Creation Status": `${isWarehouseTableSuccess ? "🟢 Successful":"🔴 Failed"}`,
            "Warehouse Data Insertion Status": `${isWarehouseDataSuccess ? "🟢 Successful":"🔴 Failed"}`,
            "Products Table Data Insertion Status": `${isProductsTableDataTransfer ? "🟢 Successful":"🔴 Failed"}`
        }
    );
}


//Data init functions
let wareHouseTableCreator = () => {
    let wareHousesCreated = wareHouses.length
    for (let i = 0; i < wareHouses.length; i++) {
        let wareHouseSQL = `CREATE TABLE ${wareHouses[i].name}(id int AUTO_INCREMENT, warehouse_name VARCHAR(255), address VARCHAR(255), area VARCHAR(255),contact_info VARCHAR(255),products VARCHAR(65535),sourcing_price float(24),PRIMARY KEY (id))`
        db.query(wareHouseSQL, (err, result) => {
            if (err) {
                console.log(err)
                wareHousesCreated--
                console.error(`🔴 Error occurred while creating ${wareHouses[i].name} table`)
            }
            console.log(`🟢 ${wareHouses[i].name} was created`)
        })
    }
}


let InsertWareHouseData = () => {
    let counter = 0
    for (let i = 0; i < wareHouses.length; i++) {
        let data = {
            warehouse_name: wareHouses[i].name,
            address: wareHouses[i].address,
            area: wareHouses[i].area,
            contact_info: wareHouses[i].contact_info,
            products: JSON.stringify(wareHouses[i].products),
            sourcing_price: wareHouses[i].sourcing_price,
        }

        let InsertWarehouseDataSQL = `INSERT INTO ${wareHouses[i].name} SET ?`
        db.query(InsertWarehouseDataSQL,data,(err, result) => {
            if (err) {
                console.log(err)
                console.error(`🔴 Error occurred while Inserting Data ${wareHouses[i].name}`)
            }
            counter++
            console.log(`🟢 Data insertion was successful`)
        })
    }
}


//products
let products = (req, res) => {
    let allWareHouses = []
    //getting all warehouse table names
    for(let i =0; i<wareHouses.length; i++){
        allWareHouses.push(wareHouses[i].name)
    }
    db.query(SQL.getProducts,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while retrieving products")
        }
        console.log(`🟢 Products fetching was successful`)
        return res.status(200).json(
            {
                wareHouses: allWareHouses, //returns array of strings
                products: result, //returns all the products in the products table
            }
        ); //this will return a json array
    })
}


//filtering products
let filterProducts = (req, res) => {
    let sql = `SELECT * FROM products WHERE prod_origin='${req.params.id}'`

    db.query(sql,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while filtering products")
            return res.status(400).send({
                "Error": "Bad Request"
            })
        }
        console.log(`🟢 Filtered Products Fetching Was Successful`)
        return res.status(200).send(result) //this will return a json array
    })
}

//searching products
let searchProducts = (req, res) => {
    let searchSQL = `SELECT * FROM products WHERE prod_name LIKE ${req.params.query} OR description LIKE ${req.params.query}`
    console.log(`Search Query: ${req.params.query}`)
    db.query(searchSQL, (err, result) => {
        if (err) {
            console.log(err)
            console.error("🔴 Error while searching products")
            return res.status(400).json(
                {
                    "Error": "Bad Request" 
                }
            ); 
        }
        console.log(`🟢 Products searching was successful`)
        return res.status(200).json(
            {
                searchQuery: req.params.query,
                products: result, //returns all the products in the products table
            }
        ); //this will return a json array
    })
}

//adding dummy products
let addProducts = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    db.query(SQL.getProducts,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while retrieving products")
        }
        console.log(`🟢 Products fetching was successful`)
        return res.status(200).json(result); //this will return a json array
    })
}


//checkout
let checkout = (req, res) => {
    //this route is almost like products but here out of stock products are excluded 
    let sql = `SELECT * FROM products WHERE in_stock!='no'`

    db.query(sql,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while filtering products")
            return res.status(400).send({
                "Error": "Bad Request"
            })
        }
        console.log(`🟢 Filtered Products Fetching Was Successful`)
        return res.status(200).send(result) //this will return a json array
    })
}

let buyProducts = (req, res) => {
    if(!req.query.userKey || req.query.userKey !== process.env.USER_KEY){
        return res.status(401).json(
            {
                "Error": "Unauthorized Access !"
            }
        ) 
    }
    if(!req.query.amount){
        return res.status(400).json(
            {
                "Error": "Invalid Amount !"
            }
        ) 
    }

    let prodStateUpdateSQL = `UPDATE products SET  inventory = inventory - ${req.query.amount}  WHERE id = ${req.params.id}`

    db.query(prodStateUpdateSQL,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while updating product")
            return res.status(400).json(
                {
                    "Error": "Bad Request"
                }
            ) 
        }
        console.log(`🟢 Product updating was successful`)
        return res.status(200).json(
            {
                "Status": `Successfully updated the product#${req.params.id}`
            }
        ) 
    })
}


//admin
let admin = (req, res) => {
    let allWareHouses = []
    //getting all warehouse table names
    for(let i =0; i<wareHouses.length; i++){
        allWareHouses.push(wareHouses[i].name)
    }
    db.query(SQL.getProducts,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while retrieving products")
        }
        console.log(`🟢 Products fetching was successful`)
        return res.status(200).json(
            {
                userMode: "Admin",
                wareHouses: allWareHouses, //returns array of strings
                products: result, //returns all the products in the products table
            }
        ); //this will return a json array
    })
}

let updateProductState = (req, res) => {

    let productConfig = {
        in_stock: req.query.inStock,
        inventory: req.query.inventory
    }
    if(!req.query.adminKey || req.query.adminKey !== process.env.ADMIN_KEY){
        return res.status(401).json(
            {
                "Error": "Unauthorized Access !"
            }
        ) 
    }

    if(!req.query.inStock || !req.query.inventory){
        return res.status(400).json(
            {
                "Error": "Either or both inStock, inventory query was missing"
            }
        ) 
    }

    let prodStateUpdateSQL = `UPDATE products SET in_stock=${productConfig.in_stock}, inventory=${productConfig.inventory}  WHERE id = ${req.params.id}`

    db.query(prodStateUpdateSQL,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while updating product")
            return res.status(400).json(
                {
                    "Error": "Bad Request"
                }
            ) 
        }
        console.log(`🟢 Post updating was successful`)
        return res.status(200).json(
            {
                "Status": `Successfully updated the product#${req.params.id}`
            }
        ) 
    })
}




module.exports = {
    apiStatus: apiStatus,
    apiIntro: apiIntro,

    products: products,
    filterProducts: filterProducts,
    searchProducts:searchProducts,
    addProducts: addProducts,

    checkout: checkout,
    buyProducts: buyProducts,

    admin: admin,
    updateProductState: updateProductState,


    //init
    dataInit: dataInit,
}