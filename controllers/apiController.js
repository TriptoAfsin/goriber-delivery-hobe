require("dotenv").config();
const mySql = require('mysql')
const fs = require('fs')

//mock Datas
let rawData = fs.readFileSync('./controllers/mockData.json')
let wareHouses = JSON.parse(rawData);


//sql queries
let SQL = {
    createProductsTable: "CREATE TABLE products(id int AUTO_INCREMENT, prod_name VARCHAR(255), selling_price float(24), description VARCHAR(255),inventory int,in_stock binary,PRIMARY KEY (id))",
    getProducts: "SELECT * FROM products",
    addProduct: "INSERT INTO products SET ?",
    getTableNames: "SELECT table_name FROM information_schema.tables WHERE table_type = 'base table'"
}


let apiStatus = {
    endPoints: [
        "/products",
        "/checkout",
        "/admin"
      ],
    DB_Connection_Status: false
}

//API Intro Page
let apiIntro = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json(apiStatus);
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
    //checks if products table is already present or not
    db.query(SQL.getTableNames, (err, result) => {
        if(err){
            return console.error("🔴 Error occurred while getting table names")
        }
        for(let i = 0; i < result.length; i++){
            if(result[i].table_name === "products"){
                return console.log("🔵 Found Products Table")
            }
        }

        console.log("🟡 Products Table Was Not Found, trying to create products table")

        //when products table is not found, tries to create a products table 
        db.query(SQL.createProductsTable, (err, result)=> {
            if(err){
                console.log(err)
                return console.error("🔴 Error occurred while creating products table")
            }
            console.log(`🟢 Products table was created`)
        })
        
    })
}

let dataInit = (req, res) => {
    //creating warehouse table
    wareHouseTableCreator()
    //inserting warehouse data into those tables
    InsertWareHouseData()

    return res.status(200).json(
        {
            status: "Data Initialization Complete"
        }
    );
}


//Data init functions
let wareHouseTableCreator = () => {
    let wareHousesCreated = wareHouses.length
    for (let i = 0; i < wareHouses.length; i++) {
        let wareHouseSQL = `CREATE TABLE ${wareHouses[i].name}(id int AUTO_INCREMENT, warehouse_name VARCHAR(255), address VARCHAR(255), area VARCHAR(255),contact_info VARCHAR(255),products VARCHAR(255),sourcing_price float(24),PRIMARY KEY (id))`
        db.query(wareHouseSQL, (err, result) => {
            if (err) {
                console.log(err)
                wareHousesCreated--
                return console.error(`🔴 Error occurred while creating ${wareHouses[i].name} table`)
            }
            console.log(`🟢 ${wareHouses[i].name} was created`)
        })
    }

    /*
    return res.status(200).json(
        {
            wareHouses: `${wareHousesCreated}`
        }
    );
    */
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
                return console.error(`🔴 Error occurred while Inserting Data ${wareHouses[i].name}`)
            }
            counter++
            console.log(`🟢 Data insertion was successful`)
        })
    }

    /*
    return res.status(200).json(
        {
            dataInsertedSuccessfully: counter
        }
    );
    */
}






//products
let products = (req, res) => {
    let allWareHouses = []
    //getting all warehouse table names
    for(let i =0; i<wareHouses.length; i++){
        allWareHouses.push(wareHouses[i].name)
    }
    console.log(allWareHouses)

    let allProducts = []
    //getting all the products and inserting in the allProducts array
    for(let i =0; i<wareHouses.length; i++){
        allProducts.push(wareHouses[i].products)
    }

    res.header("Access-Control-Allow-Origin", "*");

    db.query(SQL.getProducts,(err, result)=> {
        if(err){
            console.log(err)
            console.error("🔴 Error while retrieving products")
        }
        console.log(`🟢 Products fetching was successful`)
        return res.status(200).json(allProducts); //this will return a json array
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
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json(apiStatus);
}


//admin
let admin = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json(apiStatus);
}




module.exports = {
    apiStatus: apiStatus,
    apiIntro: apiIntro,
    products: products,
    addProducts: addProducts,
    checkout: checkout,
    admin: admin,


    //init
    dataInit: dataInit,
}