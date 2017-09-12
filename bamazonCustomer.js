var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('cli-table2');

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
    var table = new Table({
      head: ['Item #', 'Product Name', 'Price'],
      colWidths: [8, 45, 12]
    });
    for (i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, '$' + parseFloat(res[i].price).toFixed(2)]);
    }
    console.log(table.toString());
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
    var table = new Table({
      head: ['Item #', 'Product Name', 'Price', 'Quantity', 'Total Cost'],
      colWidths: [8, 45, 12, 10, 12]
    });
    table.push([item, res[0].product_name, '$' + parseFloat(res[0].price).toFixed(2), quantity, '$' + parseFloat(res[0].price * quantity).toFixed(2)]);
    console.log(table.toString());
    orderReview(item, quantity, parseFloat(res[0].price * quantity).toFixed(2))
  });
}

function orderReview(item, quantity, totalCost) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Is this order correct?\n',
    name: 'doOrderConfirm'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doOrderConfirm) {
      console.log('\nYour purchase has been confirmed. Thank you for shopping Bamazon. BAM!\n');
      computeUpdatedQuantity(item, quantity, totalCost);
    } else {
      cancelOrder(item, quantity, 'orderReview');
    }
  });
}

function computeUpdatedQuantity(item, quantity, totalCost) {
  connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: item }, function(err, res) {
    if (err) throw err;
    newQuantity = res[0].stock_quantity - quantity;
    updateProductStockQuantity(item, newQuantity, totalCost)
  });
}

function updateProductStockQuantity(item, quantity, totalCost) {
  connection.query("UPDATE products SET ?,? WHERE ?", [
    { stock_quantity: quantity },
    { product_sales: totalCost },
    { item_id: item }
  ], function(err, res) {
    if (err) throw err;
  });
  displayAllProducts();
}

function endPoint() {
  connection.destroy();
  console.log('\nThank you for shopping Bamazon. BAM!\n');
}