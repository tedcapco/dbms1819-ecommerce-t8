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

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM Products01', (req, data)=>{
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


app.get('/brands', function(req, res) {
		 client.query('SELECT * FROM products_brand')
	.then((result)=>{
	    console.log('results?', result);
		res.render('brand-list', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/categories', function(req, res) {
		 client.query('SELECT * FROM products_category')
	.then((result)=>{
	    console.log('results?', result);
		res.render('category-list', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});



app.post('/insertbrand', function(req, res) {
	client.query("INSERT INTO products_brand (name,description) VALUES ('"+req.body.name+"','"+req.body.description+"')");
	res.redirect('/brands');
});

app.post	('/insertcategory', function(req, res) {
	client.query("INSERT INTO products_category (name) VALUES ('"+req.body.name+"')");
	res.redirect('/categories');
});

app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products (name,descriptions,price,category_id,brand_id,pic) VALUES ('"+req.body.name+"', '"+req.body.descriptions+"', '"+req.body.price+"', '"+req.body.category+"', '"+req.body.brand+"','"+req.body.pic+"')");
	res.redirect('/');
});

app.post('/updateproduct/:id', function(req, res) {
	client.query("UPDATE products SET name = '"+req.body.productsname+"', descriptions = '"+req.body.productsdesc+"', price = '"+req.body.productsprice+"',category_id = '"+req.body.category+"', brand_id = '"+req.body.brand+"', pic = '"+req.body.productspic+"'WHERE id = '"+req.params.id+"' ;");
	client.query("UPDATE products_brand SET description = '"+req.body.branddesc+"' WHERE id ='"+req.params.id+"';");
	
	res.redirect('/');
});


app.get('/brand/create', function(req, res) {
	res.render('create-brand',{
	});
});

app.get('/category/create', function(req, res) {
	res.render('create-category',{
	});
});

app.get('/product/create', function(req, res) {
	 var category = []; 
	 var brand = [];
	 var both =[];
	 client.query('SELECT * FROM products_brand')
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
		res.render('create-product',{
			rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

});

app.get('/product/update/:id', function(req, res) {
     var category = []; 
	 var brand = [];
	 var both =[];
	  client.query('SELECT * FROM products_brand;')
	.then((result)=>{
		brand = result.rows;
	    console.log('brand:',brand);
	    both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category;')
	.then((result)=>{
		category = result.rows;
	  
	    both.push(category);
	      console.log('both',both);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	 client.query('SELECT products.id AS productsid,products.pic AS productspic,products.name AS productsname, products.descriptions AS productsdesc,products.price AS productsprice,products_brand.name AS productsbrand,products_brand.description AS branddesc,products_category.name AS categoryname FROM products INNER JOIN products_brand ON products.brand_id=products_brand.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+';')
	.then((result)=>{
		res.render('update-product', {
			rows: result.rows[0],
			brand: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

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
        from: '"" <>',
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

app.listen(3000,function() {
	console.log('Server started at port 3000');
});