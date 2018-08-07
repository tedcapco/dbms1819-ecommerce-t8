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

/*
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Double Monk Strap - Black', 'Footware', 'Originally, The monk strap had a difficult time being placed in either the formal or casual ends of the shoe-wearing spectrum. Considered too casual to be worn with a suit and too formal for many casual environments.', 'Marquins', 2195.00, '/Double Monk Strap Black.jpg');
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Longwing - Cognac Brown', 'Footware', 'Greenwich Vintage’s built-to-order cognac brown longwing with white mid-sole and baby blue commando sole.', 'Marquins', 2395.00, '/Longwing Cognac Brown.jpg');
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Captoe - Black', 'Footware', 'In the recent past, we covered various types of men’s boots and shoes, both formal and casual. In our Brogues Shoe Guide for Men, we touched lightly upon the difference between Oxford and Derby shoes.', 'Marquins', 2195.00, '/Captoe Black.jpg');
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Captoe - Cognac Brown', 'Footware', 'Cap toe Italian Leather dress shoes in contrasting brown leathers. The Cap Toe Griffin Brown Antique is crafted from smooth leather with a cap toe.', 'Marquins', 2195.00, '/Captoe Cognac Brown.jpg');
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Brogue Captoe Oak Brown', 'Footware', 'The Half Brogue Kendrik cap toe dress shoes in brown antique is hand-made from premium Italian leather with a cap toe and bold color combination.', 'Marquins', 2195.00, '/Brogue Captoe Oak Brown.jpg');
INSERT INTO Products01(name, type, description, brand, price, pic) VALUES('Longwing - Black', 'Footware', 'Black French Calf upper framed with matching black edge stain on our Leo last. Historically, a pattern color combination that is recognized as the "work horse" classic business shoe.', 'Marquins', 2395.00, '/Longwing Black.jpg');

*/
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
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'iemaniamailer@yahoo.com', 
            pass: 'custominearmonitor' 
            /*
            user: 'iemaniamailer@google.com', 
            pass: 'custominearmonitor' 
        host: 'smtp.mail.yahoo.com'
            */
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

app.listen(3000,function() {
	console.log('Server started at port 3000');
});