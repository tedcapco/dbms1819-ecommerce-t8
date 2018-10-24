 var Admin = {
  topCustomersMostOrder: (client,filter,callback) => {
      const query =  `
          SELECT first_name AS first_name, last_name, 
          COUNT (orders.customer_id)
          FROM customers
          INNER JOIN orders ON orders.customer_id = customers.id
          GROUP BY customer_id, customers.first_name, customers.last_name
          ORDER BY COUNT DESC LIMIT 10;
      `;
      client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
   topCustomersHighestPayment: (client,filter,callback) => {
      const query =  `
          SELECT DISTINCT customers.first_name, customers.last_name,
          SUM (products.price * orders.quantity)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id
          GROUP BY customers.first_name, customers.last_name 
          ORDER BY SUM DESC LIMIT 10;
      `;
      client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
  },
  mostOrderedBrand: (client, filter, callback) => {
    const query =  `
          SELECT brands.brand_name AS brand_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) DESC) AS ROW,
          SUM(orders.quantity) as total
          FROM orders
          INNER JOIN products ON orders.product_id=products.id
          INNER JOIN brands
          ON products.brand_id=brands.id
          GROUP BY brand_name
          ORDER BY SUM(orders.quantity) DESC
          LIMIT 3;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  mostOrderedProduct: (client, filter, callback) => {
    const query =  `
          SELECT products.product_name AS product_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) DESC) AS ROW,
          SUM(orders.quantity) AS TOTAL
          FROM orders
          INNER JOIN products ON orders.product_id = products.id
          GROUP BY product_name
          ORDER BY SUM(orders.quantity) DESC
          LIMIT 10;
      `;
      client.query(query, (req, result) => {
        // console.log(result.rows)
        callback(result.rows)
      });
  },
  leastOrderedProduct: (client, filter, callback) => {
    const query =  `
          SELECT products.product_name AS product_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) ASC) AS ROW ,
          SUM(orders.quantity) AS TOTAL
          FROM orders
          INNER JOIN products ON orders.product_id = products.id
          GROUP BY product_name
          ORDER BY SUM(orders.quantity) ASC
          LIMIT 10;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  zeroDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE
          AND order_date < CURRENT_DATE + INTERVAL '1 DAY';
      `;
      client.query(query, (req, result) => {
        // console.log(result.rows)
        callback(result.rows)
      });
  },
  oneDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '1 DAY'
          AND order_date < CURRENT_DATE;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  twoDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '2 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  threeDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '3 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '2 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  fourDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '4 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '3 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  fiveDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '5 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '4 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  sixDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '6 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '5 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  sevenDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(order_date) FROM orders
          WHERE order_date >= CURRENT_DATE - INTERVAL '7 DAYS'
          AND order_date < CURRENT_DATE - INTERVAL '6 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  totalSalesLast7days: (client, filter, callback) => {
    const query =  `
          SELECT SUM(orders.quantity * products.price)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id WHERE order_date BETWEEN CURRENT_DATE - INTERVAL '7 DAYS'
          AND CURRENT_DATE + INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  totalSalesLast30days: (client, filter, callback) => {
    const query =  `
          SELECT SUM(orders.quantity * products.price)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id WHERE order_date BETWEEN CURRENT_DATE - INTERVAL '30 DAYS'
          AND CURRENT_DATE + INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
};

module.exports = Admin;