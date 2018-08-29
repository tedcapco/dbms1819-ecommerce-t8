const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
	database: 'de067mu7313q4f',
	user: 'jadjumlpkcstgp',
	password: 'e253d1d1666a44fbc5ed73da34d52fbf1e4a531f25fbef771a8675104be12168',
	host: 'ec2-54-204-23-228.compute-1.amazonaws.com',
	port: 5432,
	ssl: true
});
/*
const client = new Client({
	database: 'storedb',
	user: 'postgres',
	password: 'admin',
	host: 'localhost',
	port: 5432
});
*/
client.connect()
	.then(function() {
		console.log('connected to database!');
	})
	.catch(function() {
		console.log('Error');
	})



//View engine setup
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req,res) {
	client.query('SELECT * FROM products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home',{
			data: list,
			title: 'Product List'
		});
	});
});

app.get('/product/admin', function(req,res) {
	client.query('SELECT * FROM products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('product_admin',{
			data: list,
			title: 'Admin Product'
		});
	});
});

/*app.get('/products/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT * FROM products LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		res.render('products',{
			data: list
		});
	});
}); */

app.get('/brands', function(req,res){
	client.query("SELECT * FROM	brands")
	.then((result)=>{
			console.log('results?', result);
		res.render('brands', result);
	})
	.catch((err)=>{
		console.log('error',err);
		res.send('ERROR!');
	});
	
});

app.get('/brands/create', function(req, res) {
	res.render('brand_create',{
	});
})

app.post('/insertbrand', function(req,res) { //brand list insert 
	client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('"+req.body.brand_name+"','"+req.body.brand_description+"')")
	.then((result)=>{
	res.redirect('/brands');
})
	.catch((err)=>{
		console.log('error',err);
		res.send('INVALID input! Brand already exist!');
	});
});

app.get('/category/create', function(req,res){
	res.render('category_create',{

	});
});

app.get('/categories', function(req,res){
	client.query("SELECT * FROM	products_category")
	.then((result)=>{
			res.render('categories',result);

	})
	.catch((err)=>{
		console.log('error',err);
		res.send('ERROR category list!');
	});
});

app.post('/category/create/saving', function(req, res) {
	client.query("INSERT INTO products_category (category_name) VALUES ('"+req.body.category_name+"')")
	.then((result)=>{
	res.redirect('/categories');
})
	.catch((err)=>{
		console.log('error',err);
		res.send('Invalid input! Category already exist!');
	});
});


app.get('/products/:id', (req, res) => {
	client.query('SELECT products.id AS id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS price, products.product_description AS product_description, products.pic AS pic, brands.brand_name AS brand_name,  products_category.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+';')
		.then((results)=>{
		console.log ('results?',results);
		res.render('products',{
			id: results.rows[0].id,
			product_name: results.rows[0].product_name,
			product_description: results.rows[0].product_description,
			price: results.rows[0].price,
			pic: results.rows[0].pic,
			brand_name: results.rows[0].brand_name,
			category_name: results.rows[0].category_name,
			})
		})
		.catch((err) => {
			console.log('error',err);
			res.send('Error products!');
		});
});

app.get('/products/admin/:id', (req, res) => {
	client.query('SELECT products.id AS id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS price, products.product_description AS product_description, products.pic AS pic, brands.brand_name AS brand_name,  products_category.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+';')
		.then((results)=>{
		console.log ('results?',results);
		res.render('products_admin',{
			id: results.rows[0].id,
			product_name: results.rows[0].product_name,
			product_description: results.rows[0].product_description,
			price: results.rows[0].price,
			pic: results.rows[0].pic,
			brand_name: results.rows[0].brand_name,
			category_name: results.rows[0].category_name,
			})
		})
		.catch((err) => {
			console.log('error',err);
			res.send('Error products!');
		});
});

// EMAIL


app.post('/products/:id/send', function(req, res) {
	client.query("INSERT INTO customers (email,first_name,last_name,street,municipality,province,zipcode) VALUES ('"+req.body.email+"','"+req.body.first_name+"','"+req.body.last_name+"','"+req.body.street+"','"+req.body.municipality+"','"+req.body.province+"','"+req.body.zipcode+"') ON CONFLICT (email) DO UPDATE SET first_name = '"+req.body.first_name+"', last_name = '"+req.body.last_name+"', street = '"+req.body.street+"',municipality = '"+req.body.municipality+"',province = '"+req.body.province+"',zipcode = '"+req.body.zipcode+"' WHERE customers.email ='"+req.body.email+"';");
	client.query("SELECT id FROM customers WHERE email = '"+req.body.email+"';")
   	.then((results)=>{
   		var id = results.rows[0].id;
   		console.log(id);
   		client.query("INSERT INTO orders (customer_id,product_id,quantity) VALUES ("+id+","+req.params.id+",'"+req.body.quantity+"')")
   		.then((results)=>{
			var maillist = ['dbms1819team8@gmail.com',req.body.email];
			var transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: {
					user: 'dbms1819team8@gmail.com',
					pass: 'capcogarciat8'
				}
			});
      const mailOptions = {
          from: '"Shoop" <dbms1819team8@gmail.com>', // sender address
          to: maillist, // list of receivers
          subject: 'Order Details', // Subject line
          html: 
				'<p>You have a new contact request</p>'+
				'<h3>Customer Details</h3>'+
					'<ul>'+
						'<li>Customer Name: '+req.body.first_name+' '+req.body.last_name+'</li>'+
						'<li>Email: '+req.body.email+'</li>'+
						'<li>Product Name: '+req.body.product_name+'</li>'+
						'<li>Quantity: '+req.body.quantity+'</li>'+
					'</ul>'
      };

      transporter.sendMail(mailOptions, (error, info) => {	
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);;
          res.redirect('/');
          });
   		})
   		.catch((err)=>{
   		console.log('error',err);
		res.send('Error in e-mail!');
   		});
   	})
   	.catch((err) => {
		console.log('error',err);
		res.send('Error products sending!');
	});
});



// app.post('/products/:id/send', function(req, res) {
// 	client.query("INSERT INTO customers (email,first_name,last_name,street,municipality,province,zipcode) VALUES ('"+req.body.email+"','"+req.body.first_name+"','"+req.body.last_name+"','"+req.body.street+"','"+req.body.municipality+"','"+req.body.province+"','"+req.body.zipcode+"') ON CONFLICT (email) DO UPDATE SET first_name = '"+req.body.first_name+"', last_name = '"+req.body.last_name+"', street = '"+req.body.street+"',municipality = '"+req.body.municipality+"',province = '"+req.body.province+"',zipcode = '"+req.body.zipcode+"' WHERE customers.email ='"+req.body.email+"';");
// 	client.query("SELECT id FROM customers WHERE email = '"+req.body.email+"';")
//    	.then((results)=>{
//    		var id = results.rows[0].id;
//    		console.log(id);
//    		client.query("INSERT INTO orders (customer_id,product_id,quantity) VALUES ("+id+","+req.params.id+",'"+req.body.quantity+"')")
//    		.then((results)=>{
// 			var maillist = ['dbms1819team8@gmail.com',req.body.email];
// 			var transporter = nodemailer.createTransport({
// 				host: 'smtp.gmail.com',
// 				port: 465,
// 				secure: true,
// 				auth: {
// 					user: 'dbms1819team8@gmail.com',
// 					pass: 'capcogarciat8'
// 				}
// 			});
//       const mailOptions = {
//           from: '"Shoop Shop" <dbms1819team8@gmail.com>', // sender address
//           to: maillist, // list of receivers
//           subject: 'Details of order from Shoop', // Subject line
//           html: 
// 				'<p>You have a new contact request</p>'+
// 				'<h3>Customer Details</h3>'+
// 					'<ul>'+
// 						'<li>Customer Name: '+req.body.first_name+' '+req.body.last_name+'</li>'+
// 						'<li>Email: '+req.body.email+'</li>'+
// 						'<li>Product Name: '+req.body.name+'</li>'+
// 						'<li>Quantity: '+req.body.quantity+'</li>'+
// 					'</ul>'
//       };

//       transporter.sendMail(mailOptions, (error, info) => {	
//           if (error) {
//               return console.log(error);
//           }
//           console.log('Message %s sent: %s', info.messageId, info.response);;
//           res.redirect('/');
//           });
//    		})
//    		.catch((err)=>{
//    		console.log('error',err);
// 		res.send('Error in e-mail!');
//    		});
//    	})
//    	.catch((err) => {
// 		console.log('error',err);
// 		res.send('Error in products sending!');
// 	});
// });

/*app.post('/brands', function(req,res) { //brand list insert 
	var values =[];
	values = [req.body.brand_name,req.body.brand_description];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO brands(brand_name, brand_description) VALUES($1, $2)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/brands');
});
app.get('/edit', (req,res)=>{
	var id = req.params.id;
	res.render('edit');
}); */


/* app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity: ${req.body.quantity}</li>
		</ul>
	`;
	//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.mail.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'caga.dbms@gmail.com', 
            pass: 'caga.dbms1819' 
          
        }
    });
    let mailOptions = {
        from: '"IEMania Mailer" <iemaniamailer@yahoo.com>',
        to: 'tedcapco@gmail.com, garcianashpatrick@gmail.com',
        subject: 'ShoopShop Order',
        //text: req.body.name,
        html: output
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        client.query('SELECT * FROM products', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: '---Email has been sent---'
			});
		});
     });
}); */

app.get('/product/create', function(req, res) {
	 var category = []; 
	 var brand = [];
	 var both =[];
	 client.query('SELECT * FROM brands')
	.then((result)=>{
	    brand = result.rows;
	    console.log('brand:',brand);
	     both.push(brand);
	})
	.catch((err) => {       
		console.log('error',err);
		res.send('Error on creating product!');
	});
    client.query('SELECT * FROM products_category')
	.then((result)=>{
	    category = result.rows;
	    both.push(category);
	    console.log(category);
	    console.log(both);
		res.render('product_create',{
			rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error! Product already exist!');
	});

});

app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products (product_name, product_description, price, pic, category_id, brand_id) VALUES ('"+req.body.product_name+"','"+req.body.product_description+"', '"+req.body.price+"', '"+req.body.pic+"', '"+req.body.category_id+"', '"+req.body.brand_id+"')");
	res.redirect('/');
});

/*app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products (pic,product_name,product_description,price,category_id,brand_id) VALUES ('"+req.body.pic+"','"+req.body.product_name+"','"+req.body.product_description+"','"+req.body.price+"','"+req.body.category_id+"','"+req.body.brand_id+"')")
	.then(result=>{
		console.log('results?', result);
		res.redirect('/');
	})
	.catch(err => {
		console.log('error',err);
		res.send('Errorrrr!');
	});
	
}); */

app.get('/product/update/:id', function(req,res) {
	var category = [];
	var brand = [];
	var product = [];
	var both = [];
	client.query('SELECT * FROM products_category')
	.then((result)=>{
		category = result.rows;
		console.log('category:', category);
		both.push(category);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error product update!');
	});
	client.query('SELECT * FROM brands')
	.then((result)=>{
		brand = result.rows;
		console.log('brand:', brand);
		both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on Update!');
	});
	client.query('SELECT products.id AS id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS price, products.product_description AS product_description, products.pic AS pic FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+';')
	.then((result)=>{
		product = result.rows[0];
		both.push(product);
		console.log(product);
		console.log(both);
		res.render('product_update', {
			rows: result.rows[0],
			brand: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on Update!');
	});	
});

app.post('/product/update/:id/saving', function(req,res) {
	client.query("UPDATE products SET product_name = '"+req.body.product_name+"', product_description = '"+req.body.product_description+"', price = '"+req.body.price+"', category_id = '"+req.body.category_id+"', brand_id = '"+req.body.brand_id+"', pic = '"+req.body.pic+"'WHERE id = '"+req.params.id+"' ;")
	.then(result=>{
		console.log('results?', result);
		res.redirect('/');
	})
	.catch(err => {
		console.log('error',err);
		res.send('Error!');
	});
	
});




app.get('/customers', function(req, res) {
	client.query('SELECT * FROM customers ORDER BY id DESC')
	.then((result)=>{
		console.log('results?', result);
		res.render('list_customer', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on customer list!');
	});
});

app.get('/customers/:id', (req, res) => {
	client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,customers.street AS street,customers.municipality AS municipality,customers.province AS province,customers.zipcode AS zipcode,products.product_name AS product_name,orders.quantity AS quantity,orders.order_date AS order_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id WHERE customers.id = "+req.params.id+"ORDER BY order_date DESC;")
	.then((result)=>{
	   console.log('results?', result);
		res.render('customer_details', {
			first_name: result.rows[0].first_name,
			last_name: result.rows[0].last_name,
			email: result.rows[0].email,
			street: result.rows[0].street,
			municipality: result.rows[0].municipality,
			province: result.rows[0].province,
			zipcode: result.rows[0].zipcode,
			product_name: result.rows[0].product_name,
			quantity: result.rows[0].quantity,
			order_date: result.rows[0].order_date,
			rows: result.rows[0]
		})
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on customer details!');
	});

});

app.get('/orders', function(req, res) {
	 client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,products.product_name AS name,orders.quantity AS quantity,orders.order_date AS order_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id ORDER BY order_date DESC;")
	.then((result)=>{
	    console.log('results?', result);
		res.render('list_order', result);
		})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on orders list!');
	});

});

app.get('/orders', function(req, res) {
	 client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,products.product_name AS name,orders.quantity AS quantity,orders.order_date AS order_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id ORDER BY order_date DESC;")
	.then((result)=>{
	    console.log('results?', result);
		res.render('list_order', result);
		})
	.catch((err) => {
		console.log('error',err);
		res.send('Error on orders list!');
	});

});

app.get('/admin', function(req,res) {
	res.render('admin');
});


app.listen(process.env.PORT || 5000, function() {
  console.log('Server has started');
});




/*
INSERT INTO products(product_name,product_description,price,pic,category_id" INT REFERENCES products_category(id),
brand_id" INT REFERENCES brands(id)
);
1. Captoe Black,https://images-na.ssl-images-amazon.com/images/I/51Dic30JKEL._UY395_.jpg
2. Brogue Captoe Oak Brown,https://media.karousell.com/media/photos/products/2018/01/03/antonio_meccariello_brogue_captoe_oxford_1514987620_d17a16110
3. Longwing Black,https://shop.r10s.jp/crispin/cabinet/alden/9751_01.jpg
4.Double Monk Strap Black,https://www.afarleycountryattire.co.uk/wp-content/uploads/2014/06/barker-shoes-tunstall-double-monk-strap-black-calf.jpg
5. Captoe Cognac Brown,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbsCvWmM6Z07EqusyCPBeqbjnv72XE5FJ5FXJ6OvkjNy12mw8sCA
6. Longwing Cognac Brown, https://i.ebayimg.com/images/g/C00AAOSwD0lUckE9/s-l400.jpg
CREATE UNIQUE INDEX CONCURRENTLY customers_id ON customers (id);ALTER TABLE customers ADD CONSTRAINT unique_id UNIQUE (email);
CREATE UNIQUE INDEX CONCURRENTLY brands_brand_name ON brands (brand_name);
ALTER TABLE brands ADD CONSTRAINT unique_brand_name UNIQUE (brand_name);
*/