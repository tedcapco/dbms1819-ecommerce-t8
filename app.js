const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');

// instantiate client using your DB configurations
const client = new Client({
	database: 'de067mu7313q4f',
	user: 'jadjumlpkcstgp',
	password: 'e253d1d1666a44fbc5ed73da34d52fbf1e4a531f25fbef771a8675104be12168',
	host: 'ec2-54-204-23-228.compute-1.amazonaws.com',
	port: 5432
});

/*connect to database
client.connect()
	.then(function() {
		console.log('connected to database!')
	})
	.catch(function(err) {
		console.log('cannot connect to database!')
	}); */

const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
// tell express to use handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', function(req, res) {
	res.send('Hello!!');
});

/*app.get('/about', function(req, res) {
	res.send('<h1>About Page</h1>');
});

app.get('/api/products', function(req, res) {

	client.query('SELECT * FROM Products', (req, data)=>{
		console.log(data.rows);
		res.json({
			data: data.rows
		})
	})
}); 
app.get('/user/:userName', function(req, res) {
	const userName = req.params.userName;
	res.send('<h1>Hi,' + userName + '!!</h1>');
}); 

app.get('/', function(req,res) {
	res.render('home',{
		content: 'This is a sample of a template engine (handlebars)!',  https://www.blogcdn.com/www.joystiq.com/media/2008/01/oasismessin44.jpg
	});
}); */

app.get('/member/1', function (req, res) {
	res.render('member', {
		name: 'Ted Christoffer M. Capco',
		email: 'tedcapco@gmail.com',
		phone: '09475768717',
		imageUrl: '/img/member1.png',
		hobbies: ['Playing guitar','listening to worship music', 'watching MTVs'],
		skills: ['Web Development', 'Front End Design'],
		fb: 'https://www.facebook.com/',
		tw: '',
		gmail: 'tedcapco@gmail.com'
	})
}); 

app.get('/member/2', function (req, res) {
	res.render('member', {
		name: 'Patrick Nash de Guzman Garcia',
		email: 'garcianashpatrick@gmail.com',
		phone: '09162209550',
		imageUrl: '/img/member2.png', // http://images5.fanpop.com/image/photos/31300000/Patrick-Stump-patrick-stump-31355378-500-331.jpg
		hobbies: ['writing poems','essays', 'short stories', 'reading books', 'watercolor painting'],
		skills: ['Web Dev', 'Leadership'],	
		fb: 'https://www.facebook.com/patricknash.deguzmangarcia',
		tw: 'https://l.messenger.com/l.php?u=https%3A%2F%2Ftwitter.com%2Fpagatrigeek&h=AT1SE-xr74Rmvh0XP917YS1IJFoaknfWacMXx2BigjwvP5XIcaXv3o9C6JB0qY6NBs0ZA9SY55BOzR8KZNQwR4prAGjBDYPu7MBO1HiHOcOAEhQz1de3QbLzzdEL_zwFLjtr',
		gmail: 'garcianashpatrick@gmail.com'
	})
}); 


app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');

}); 