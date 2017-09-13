# Bamazon
Mock Online Store with inventory management and administrative options.

#bamazonCustomer.js
How to Exit.
 
 

Invalid selection:
 
 
Default Purchase Process:
 
 
0 quantity to cancel order
![zeroqtytocancel]( https://imgur.com/Fqgb5WK)
 
Quantity Exceeds Stock
Note: Item # 1004 is no longer available for purchase as this table is populated by only items that have stock_quantity >0 
Answering No to either Purchase All or Order Correct will result in the option to cancel the order.
 
 
Answering in the negative to a cancelation will return you to the question that prompted the cancelation option:
• Entering 0 for quantity
• Answering No when quantity exceeds stock_quantity
• Answering No during Order Review
 
 
# bamazonManager.js
View Products
 
 
View Low Inventory
 
Add to Inventory
 
 
Add New Product
 
 
# bamazonSupervisor.js
Product Sales by Department
SQL Statement:
'SELECT departments.department_id, products.department_name, departments.over_head_cost, sum(products.product_sales) AS total_sales, sum(products.product_sales)-departments.over_head_cost AS total_profit FROM products INNER JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_id'
 
 

Add Department
 
 

