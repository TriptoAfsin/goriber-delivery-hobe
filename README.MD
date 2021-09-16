# Goriber Delivery Hobe API
--------------
It's a mockup backend API for "Delivery Hobe" 😁

<p align="center"><img src="https://i.imgur.com/LRsjp0F.png" width="256px" alt="Logo"></img></p>

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

### Warehouse Data Structure - 
<p align="center"><img src="https://i.imgur.com/8U4Jsqk.png"  alt="Warehouse Table"></img></p>

*N.B: There are total 3 warehouse tables like this one*


## Usage Instructions - 
1. ### Getting Products - 
    - simply goto - ```/products``` route
2. ### Filtering Products Based on Warehouses - 
    - goto - ```/products/Warehouse_Name```, e.g - ```/products/Warehouse_2```(N.B: There are only 3 warehouses - Warehouse_1, Warehouse_2, Warehouse_3) 
3. ### Searching Products - 
    - goto - ```/search?query="Prod Name or Description"``` e.g - ```/search?query="Earphone"```
4. ### Checking Out In Stock Products - 
    - goto ```/checkout``` to see only the in stock products 
5. ### Buying Products - 
    - e.g - ```/checkout/2?amount=1&userKey=YourUserKey```
    - **Precautions** - the amount can't be 0, amount can't be higher than the actual inventory(2 is the product id)
6. ### Updating Product State - 
    - e.g - ```admin/36?inStock="yes"&inventory=50&adminKey=yourAdminAPIKey```
    - **Precautions** 

        1. if ```inStock``` is set to "yes", then the inventory can't be 0
        2. if ```inStock``` is set to "no", then the inventory have to be 0

**N.B: ALL THE KEYS ARE GIVEN IN THE EMAIL**

### Areas of Improvement - 
1. The code base could be refactored more 😥
2. There were repeated blocks of codes, that could be reused if given time
3. The searching functionality is not good, I faced difficulties implementing SQL based FULLTEXT search 😖
4. The Authorization system is very basic, if given time I could learn Node based authorization Techniques (JWT etc) and try to implement it 😅


### *I'm a passionate learner who loves programming and given opportunity and proper guidance, I could contribute more*

### *Made With ♥ by TriptoAfsin*