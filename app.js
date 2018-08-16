const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

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
	client.query('SELECT * FROM Products01', (req, data)=>{
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

app.get('/products/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT * FROM Products01 LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id', (req, data)=>{
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
});

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
		res.send('ERROR!');
	});
});

app.post('/category/create/saving', function(req, res) {
	client.query("INSERT INTO products_category (category_name) VALUES ('"+req.body.category_name+"')");
	res.redirect('/categories');
})

app.post('/brands', function(req,res) { //brand list insert 
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
});


app.post('/products/:id/send', function(req, res) {
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

        client.query('SELECT * FROM Products01', (req, data)=>{
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
});

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
		res.send('Error!');
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
		res.send('Error!');
	});

});
app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO Products01 (pic,name,description,brand,price,type,category_id,brand_id) VALUES ('"+req.body.pic+"','"+req.body.name+"','"+req.body.description+"','"+req.body.brand+"','"+req.body.price+"','"+req.body.type+"','"+req.body.category_id+"','"+req.body.brand_id+"')")
	.then(result=>{
		console.log('results?', result);
		res.redirect('/');
	})
	.catch(err => {
		console.log('error',err);
		res.send('Errorrrr!');
	});
	
});

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
		res.send('Error!');
	});
	client.query('SELECT * FROM brands')
	.then((result)=>{
		brand = result.rows;
		console.log('brand:', brand);
		both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	client.query('SELECT products.product_id AS product_id, products.product_name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.product_price AS product_price, products.product_description AS product_description, products.brand_tagline AS brand_tagline, products.product_picture AS product_picture, products.warranty AS warranty FROM products LEFT JOIN brands ON products.brand_id=brands.brand_id RIGHT JOIN categories ON products.category_id=categories.category_id WHERE products.product_id = '+req.params.id+';')
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
		res.send('Error!');
	});
});

app.post('/product/update/:id/saving', function(req,res) {
	client.query("UPDATE Products01 SET product_picture = '"+req.body.product_picture+"', product_name = '"+req.body.product_name+"', product_description = '"+req.body.product_description+"', brand_tagline = '"+req.body.brand_tagline+"', product_price = '"+req.body.product_price+"', warranty = '"+req.body.warranty+"', category_id = '"+req.body.category_id+"', brand_id = '"+req.body.brand_id+"' WHERE product_id = '"+req.params.id+"';")
	.then(result=>{
		console.log('results?', result);
		res.redirect('/');
	})
	.catch(err => {
		console.log('error',err);
		res.send('Error!');
	});
	
});







app.listen(process.env.PORT || 5000, function() {
  console.log('Server has started');
});




/*
CREATE TABLE products_brand(id SERIAL PRIMARY KEY, product_id int, brand varchar(45), description varchar(250));
CREATE TABLE products_category(id SERIAL PRIMARY KEY, product_id int, category varchar(455));
*/