var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: 'root',
  password: 'password@mysql',
  database: 'bamazon'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected to MySQL: " + connection.threadId + "\n");
  menu();
});

// Menu
function menu() {
  inquirer.prompt([{
    type: 'list',
    message: 'Management Menu',
    choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
    name: 'menuSelection'
  }]).then(function(inquirerResponse) {
    switch (inquirerResponse.menuSelection) {
      case 'View Products for Sale':
        displayAllProducts();
        break;
      case 'View Low Inventory':
        displayLowInventoryItems();
        break;
      case 'Add to Inventory':
        addToInventory();
        break;
      case 'Add New Product':
        addNewProduct();
        break;
      case 'Exit':
        endPoint();
    }
  });
}

//View products for sale
function displayAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\nItem # |                 Product Name                  |   Department    |  Price   | Stock");
    for (i = 0; i < res.length; i++) {
      console.log(String(res[i].item_id) + "  " + " | " + (String(res[i].product_name) + "                                             ").slice(0, 45) + " | " + (String(res[i].department_name) + "               ").slice(0, 15) + " | " + ("$" + String(res[i].price.toFixed(2)) + "        ").slice(0, 8) + " | " + String(res[i].stock_quantity));
    }
    console.log("");
    menu();
  });
}

//view low inventory
function displayLowInventoryItems() {
  connection.query("SELECT * FROM products WHERE stock_quantity<5", function(err, res) {
    if (err) throw err;
    console.log("\nItem # |                 Product Name                  |   Department    |  Price   | Stock");
    for (i = 0; i < res.length; i++) {
      console.log(String(res[i].item_id) + "  " + " | " + (String(res[i].product_name) + "                                             ").slice(0, 45) + " | " + (String(res[i].department_name) + "               ").slice(0, 15) + " | " + ("$" + String(res[i].price.toFixed(2)) + "        ").slice(0, 8) + " | " + String(res[i].stock_quantity));
    }
    console.log("");
    menu();
  });
}

// Add to inventory
function addToInventory() {
  inquirer.prompt([{
    type: 'input',
    message: 'Enter the Item # of the product you wish to stock.\n',
    name: 'itemId'
  }]).then(function(inquirerResponse) {
    getQuantityToIncrease(inquirerResponse.itemId);
  });
}

function getQuantityToIncrease(item) {
  inquirer.prompt([{
    type: 'input',
    message: 'How many are you adding to the inventory?\n',
    name: 'increaseQuantity'
  }]).then(function(inquirerResponse) {
    displayUpdate(item, inquirerResponse.increaseQuantity);
  })
}

function displayUpdate(item, quantity) {
  connection.query("SELECT * FROM products WHERE ?", { item_id: item }, function(err, res) {
    if (err) throw err;
    console.log('UPDATE REVIEW\n');
    console.log('Current Inventory');
    console.log("Item # |                 Product Name                  | Quantity");
    console.log(String(item) + "  " + " | " + (String(res[0].product_name) + "                                             ").slice(0, 45) + " | " + (String(res[0].stock_quantity) + "    ").slice(0, 4));
    console.log('\nProposed Inventory Update');
    console.log("Item # |                 Product Name                  | Quantity");
    console.log(String(item) + "  " + " | " + (String(res[0].product_name) + "                                             ").slice(0, 45) + " | " + (String(parseInt(res[0].stock_quantity) + parseInt(quantity)) + "    ").slice(0, 4));
    updateConfirmation(item, parseInt(res[0].stock_quantity) + parseInt(quantity));
  });
}

function updateConfirmation(item, quantity) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Is this correct?',
    name: 'doUpdate'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doUpdate) {
      updateInventory(item, quantity);
    } else {
      console.log('Update Aborted');
      menu();
    }
  });
}

function updateInventory(item, quantity) {
  connection.query("UPDATE products SET ? WHERE ?", [
    { stock_quantity: quantity },
    { item_id: item }
  ], function(err, res) {
    if (err) throw err;
    console.log(res.affectedRows);
    if (res.affectedRows > 0) {
      console.log("Inventory Update Complete\n");
    }
    menu();
  });
}

// Add New Product
// 5 inqiries

function addNewProduct() {
  connection.query("SELECT item_id FROM products WHERE item_id = (SELECT MAX(item_id) FROM products)", function(err, res) {
    if (err) throw err;
    var newProductArray = [];
    newProductArray.push(parseInt(res[0].item_id + 1));
    getNewProductName(newProductArray);

  });
}

function getNewProductName(newProductArray) {
  inquirer.prompt([{
    type: 'input',
    message: 'What is the new product name? Limit 45 characters.',
    name: 'newProductName'
  }]).then(function(inquirerResponse) {
    newProductArray.push((inquirerResponse.newProductName).slice(0, 45));
    getProductDepartment(newProductArray);
  });
}

function getProductDepartment(newProductArray) {
  inquirer.prompt([{
    type: 'input',
    message: 'What department is this product from?',
    name: 'newProductDepartment'
  }]).then(function(inquirerResponse) {
    newProductArray.push(inquirerResponse.newProductDepartment);
    getProductPrice(newProductArray);
  });
}

function getProductPrice(newProductArray) {
  inquirer.prompt([{
    type: 'input',
    message: 'What is the price of the new product?',
    name: 'newProductPrice'
  }]).then(function(inquirerResponse) {
    newProductArray.push((parseFloat(inquirerResponse.newProductPrice)).toFixed(2));
    getProductStockQuantity(newProductArray);
  });
}

function getProductStockQuantity(newProductArray) {
  inquirer.prompt([{
    type: 'input',
    message: 'How many units are being added to the inventory?',
    name: 'newStockQuantity'
  }]).then(function(inquirerResponse) {
    newProductArray.push(parseInt(inquirerResponse.newStockQuantity));
    newProductUpdateDisplay(newProductArray);
  });
}

function newProductUpdateDisplay(newProductArray) {
  console.log("\nItem # |                 Product Name                  |   Department    |  Price   | Stock");
  console.log(String(newProductArray[0]) + "  " + " | " + (String(newProductArray[1]) + "                                             ").slice(0, 45) + " | " + (String(newProductArray[2]) + "               ").slice(0, 15) + " | " + ("$" + String((parseFloat(newProductArray[3])).toFixed(2)) + "        ").slice(0, 8) + " | " + String(newProductArray[4]));
  console.log("");
  newProductUpdateReview(newProductArray);
}

function newProductUpdateReview(newProductArray) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Is this information correct?',
    name: 'doNewProductUpdate'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doNewProductUpdate) {
      newProductUpdate(newProductArray)
    } else {
      console.log("\nUpdate Aborted")
      menu();
    }
  });
}

function newProductUpdate(newProductArray) {
  connection.query("INSERT INTO products (item_id,product_name,department_name,price,stock_quantity) VALUES ?", [
    [newProductArray]
  ], function(err, res) {
    if (err) throw err;
    if (res.affectedRows) {
      console.log("\nNew product added");
      menu();
    }
  });
}

function endPoint() {
  connection.destroy();
}