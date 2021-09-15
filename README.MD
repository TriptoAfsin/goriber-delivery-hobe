# Goriber Delivery Hobe API
--------------
It's a mockup backend API for "Delivery Hobe" 😁
### Technologies Used -
1. Node JS
2. Express
3. MySQL

### Project Structure -
```
├───controllers
├───routes
server.js
package.json
```

### Features - 
1. Combined warehouse based products inventory fetching
2. Products filtering by Warehouses
3. Product name and description based searching(Exact Match)
4. Checkout route that shows only in stock products and let users buy products (requires user key to buy)
5. Admin route that enables admins to change the inventory amount and stock status(requires admin key)


### Endpoints - 
1. /products
2. /products/:warehouse_name
3. /search?query="Prod Name"
4. /checkout
5. /checkout/id?amount=2&userKey=YourUserKey
6. /admin
7. /admin/:id?inStock='yes'&inventory=50&adminKey=YourAdminKey


## Working Principle - 
1. ### Data Initialization - 
    - The ```apiController``` tries to connect to the DB
    - If connected then checks if there's a ```products``` table, if not then creates a ```products``` table
    - If a ```products``` table is present then it checks if it's empty or not, if it's not empty it leaves the table as is
    - If it's empty it tries to fetch products from all the ```warehouse``` tables and insert into ```products``` table
    - *N.B the warehouse data has to be initialized at first*
2. ### More on Initilization - 
    - there's a ```/init``` route , this route is for server admins, as it makes preparations to make the ```products``` table ready, So, what does it do - 

        - Loads a mockup json data of warehouses 
        - Makes tables according to that data
        - After creating all the ```warehouse``` tables, it then inserts all the mockup data
        - *N.B: structure of this mockup data can be found in ```./controllers/mockupData.json```*   
3. ### Product Querying - 
    - This api heavily relies on SQL queries, the warehouse based filtering, search etc all are SQL queries
4. ### Checkout - 
    - Checkout route is a special kind of ```products``` route where only ```inStock="yes"``` products are shown 
    - to buy the user needs to pass the ```Product ID``` as a param and provide ```amount``` & ```userKey``` as queries
5. ### Admin - 
    - Admin route is public but to change inventory status you have to pass ```Product ID``` as a param and provide ```inStock```, ```inventory``` & ```adminKey``` as queries

### Areas of Improvement - 
1. The code base could be refactored more 😥
2. There were repeated blocks of codes, that could be reused if given time
3. The searching functionality is not good, I faced difficulties implementing SQL based FULLTEXT search 😖
4. The Authorization system is very basic, if given time I could learn Node based authorization Techniques (JWT etc) and try to implement it 😅


### *I'm a passionate learner who loves programming and given opportunity and proper guidance, I could contribute more*

### *Made With ♥ by TriptoAfsin*