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
  console.log("connected to MySQL: " + connection.threadId + "\n");
  menu();
});

function menu() {
  inquirer.prompt([{
    type: 'list',
    message: 'Management Menu',
    choices: ['View Products Sales by Department', 'Create New Department', 'Exit'],
    name: 'menuSelection'
  }]).then(function(inquirerResponse) {
    switch (inquirerResponse.menuSelection) {
      case 'View Products Sales by Department':
        displaySalesByDept();
        break;
      case 'Create New Department':
        createNewDept();
        break;
      case 'Exit':
        endPoint();
    }
  });
}

function displaySalesByDept() {
  connection.query('SELECT departments.department_id, products.department_name, departments.over_head_cost, sum(products.product_sales) AS total_sales, sum(products.product_sales)-departments.over_head_cost AS total_profit FROM products INNER JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_id', function(err, res) {
    if (err) throw err;
    var table = new Table({
      head: ['Department ID', 'Department Name', 'Over Head Cost', 'Product Sales', 'Total Profit'],
      colWidths: [15, 17, 17, 15, 14]
    });
    for (i = 0; i < res.length; i++) {
      table.push([res[i].department_id, res[i].department_name, "$" + parseFloat(res[i].over_head_cost).toFixed(2), "$" + parseFloat(res[i].total_sales).toFixed(2), "$" + parseFloat(res[i].total_profit).toFixed(2)])
    }
    console.log(table.toString());
    console.log("");
    menu();
  });
}

function createNewDept() {
  var newDeptArray = [];
  inquirer.prompt([{
    type: 'input',
    message: 'What is the name of the new department?',
    name: 'newDepartmentName'
  }]).then(function(inquirerResponse) {
    newDeptArray.push((inquirerResponse.newDepartmentName).toUpperCase());
    getOverHead(newDeptArray);
  });
}

function getOverHead(newDeptArray) {
  inquirer.prompt([{
    type: 'input',
    message: 'What is the Over Head Cost for this department?',
    name: 'newDeptOverHead'
  }]).then(function(inquirerResponse) {
    newDeptArray.push(inquirerResponse.newDeptOverHead);
    displayProposedDepartment(newDeptArray);
  });
}

function displayProposedDepartment(newDeptArray) {
  var table = new Table({
    head: ['Department Name', 'Over Head Cost'],
    colWidths: [17, 17]
  });
  table.push(newDeptArray);
  console.log(table.toString());
  confirmNewDept(newDeptArray);
}

function confirmNewDept(newDeptArray) {
  inquirer.prompt([{
    type: 'confirm',
    message: "Is this the correct information for the new Department?",
    name: 'doNewDept'
  }]).then(function(inquirerResponse) {
    if (inquirerResponse.doNewDept) {
      updateNewDept(newDeptArray);
    } else {
      console.log('Update Aborted\n');
      menu();
    }
  });
}

function updateNewDept(newDeptArray) {
  connection.query("INSERT INTO departments (department_name, over_head_cost) VALUES ?", [
    [newDeptArray]
  ], function(err, res) {
    if (err) throw err;
    if (res.affectedRows) {
      console.log("\nNew department added\n");
      menu();
    }
  });
}

function endPoint() {
  connection.destroy();
}