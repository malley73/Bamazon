# Bamazon
Mock Online Store with inventory management and administrative options.

### bamazonCustomer.js
How to Exit.
 ![exit](https://imgur.com/PJPfrEm.png)
 

Invalid selection:
![invalidselection](https://imgur.com/53k8GjF.png)
 
 
Default Purchase Process:
![defaultpurchase](https://imgur.com/BfjVYnp.png)
 
 
Zero quantity to cancel order  
![zeroqtytocancel](https://imgur.com/Fqgb5WK.png)    


Quantity Exceeds Stock  
Note: Item # 1004 is no longer available for purchase as this table is populated by only items that have stock_quantity >0   
![quantityexceedsstock](https://imgur.com/yEDXpLh.png)
Answering No to either Purchase All or Order Correct will result in the option to cancel the order.
 
 
Answering in the negative to a cancelation will return you to the question that prompted the cancelation option:  
  • Entering 0 for quantity  
  • Answering No when quantity exceeds stock_quantity  
  • Answering No during Order Review  
 ![cancelations](https://imgur.com/pahpkpX.png)
 
### bamazonManager.js
View Products  
 ![viewproducts](https://imgur.com/haSIPf9.png)  
 
 
View Low Inventory  
![viewlowinventory](https://imgur.com/1OvRwrp.png)
 
Add to Inventory
![addtoinventory](https://imgur.com/KDVw4e3.png)
 
 
Add New Product
![addnewproduct](https://imgur.com/2ku76oN.png)
 
 
### bamazonSupervisor.js
Product Sales by Department  
SQL Statement:  
'SELECT departments.department_id, products.department_name, departments.over_head_cost, sum(products.product_sales) AS total_sales, sum(products.product_sales)-departments.over_head_cost AS total_profit FROM products INNER JOIN departments ON products.department_name=departments.department_name GROUP BY departments.department_id'
 ![salesbydepartment](https://imgur.com/jZgYiqr.png)
 

Add Department
![adddepartment](https://imgur.com/lw0drvp.png)
 
 

