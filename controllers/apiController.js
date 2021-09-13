require("dotenv").config();

const mySql = require('mysql')


//sql queries
let SQL = {
    createProductsTable: "CREATE TABLE products(id int AUTO_INCREMENT, prod_name VARCHAR(255), selling_price float(24), description VARCHAR(255),inventory int,PRIMARY KEY (id))",
    getProducts: "SELECT * FROM products",
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




//products
let products = (req, res) => {
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
    checkout: checkout,
    admin: admin,
}