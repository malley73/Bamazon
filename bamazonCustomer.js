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
  console.log("connected to MySQL: " + connection.threadId);
  displayAllProducts();
});

function displayAllProducts() {
  connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(err, res) {
    if (err) throw err;
    console.log("\nItem # |                 Product Name                  | Price   ");
    for (i = 0; i < res.length; i++) {
      console.log(String(res[i].item_id) + "  " + " | " + (String(res[i].product_name) + "                                             ").slice(0, 45) + " | " + ("$" + String(res[i].price.toFixed(2))).slice(0, 8));
    }
    whatToBuy();
  });
}

function whatToBuy() {
  inquirer.prompt([{
    type: 'input',
    message: 'Please enter the Item # of the product you wish to purchase. Enter "exit" to leave without making a purchase.\n',
    name: "selectedItem"
  }]).then(function(inquirerResponse) {
    getSelectedItem(inquirerResponse.selectedItem);
  });
}

function getSelectedItem(item) {
  if (item === 'exit') {
    endPoint();
  } else {
    connection.query("SELECT item_id FROM products WHERE stock_quantity > 0", function(err, res) {
      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        //console.log(res[i].item_id + "=" + item + "?");
        if (String(item) === String(res[i].item_id)) {
          var itemFound = true;
          howMany(item);
        }
      }
      if (!itemFound) {
        console.log('\nThis Item # does not exist please try again.\n');
        displayAllProducts();
      }
    });
  }
}

function howMany(item) {
  inquirer.prompt([{
    type: 'input',
    message: 'How many would you like to purchase?\n',
    name: "selectedQuantity"
  }]).then(function(inquirerResponse) {
    if (parseInt(inquirerResponse.selectedQuantity) > 1) {
      connection.query("Select stock_quantity FROM products WHERE ?", { item_id: item }, function(err, res) {
        if (err) throw err;
        if (parseInt(inquirerResponse.selectedQuantity) > parseInt(res[0].stock_quantity)) {
          purchaseMax(item, res[0].stock_quantity);
        } else {
          console.log("\nOrder Confirmed\n");
          displayOrder(item, inquirerResponse.selectedQuantity);
        }
      });
    } else if (parseInt(inquirerResponse.selectedQuantity) === 0) {
      cancelOrder(item, 0, "howMany");
    } else {
      console.log("\nOrder Confirmed\n");
      displayOrder(item, inquirerResponse.selectedQuantity);
    }
  });
}

function purchaseMax(item, quantity) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'There are not enough of this product to cover your order. There are ' + quantity + ' available. Would you like to purchase them all?\n',
    name: 'doPurchaseMax'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doPurchaseMax) {
      displayOrder(item, quantity);
    } else {
      cancelOrder(item, quantity, 'purchaseMax');
    }
  });
}

function cancelOrder(item, quantity, state) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Do you wish to cancel this order?\n',
    name: 'doCancelOrder'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doCancelOrder) {
      console.log('\nYour order has been canceled.\n');
      displayAllProducts();
    } else if (state === 'purchaseMax') {
      purchaseMax(item, quantity);
    } else if (state === 'orderReview') {
      displayOrder(item, quantity)
    } else if (state === 'howMany') {
      howMany(item);
    }
  });
}

function displayOrder(item, quantity) {
  console.log('ORDER REVIEW');
  console.log("Item # |                 Product Name                  | Price    | Quantity | Total Cost");
  connection.query("SELECT * FROM products WHERE ?", { item_id: item }, function(err, res) {
    if (err) throw err;
    console.log(String(item) + "  " + " | " + (String(res[0].product_name) + "                                             ").slice(0, 45) + " | " + ("$" + String(res[0].price.toFixed(2)) + "        ").slice(0, 8) + " | " + (String(quantity) + "        ").slice(0, 8) + " | " + ("$" + String((res[0].price * quantity).toFixed(2)) + "          ").slice(0, 10));
    orderReview(item, quantity)
  });
}

function orderReview(item, quantity) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Is this order correct?\n',
    name: 'doOrderConfirm'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doOrderConfirm) {
      console.log('Your purchase has been confirmed. Thank you for shopping Bamazon. BAM!');
      computeUpdatedQuantity(item, quantity);
    } else {
      cancelOrder(item, quantity, 'orderReview');
    }
  });
}

function computeUpdatedQuantity(item, quantity) {
  connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: item }, function(err, res) {
    if (err) throw err;
    newQuantity = res[0].stock_quantity - quantity;
    updateProductStockQuantity(item, newQuantity)
  });
}

function updateProductStockQuantity(item, quantity) {
  connection.query("UPDATE products SET ? WHERE ?", [
    { stock_quantity: quantity },
    { item_id: item }
  ], function(err, res) {
    if (err) throw err;
    console.log(res);
  });
  displayAllProducts();
}

function endPoint() {
  connection.destroy();
  console.log('Thank you for shopping Bamazon. BAM!');
}