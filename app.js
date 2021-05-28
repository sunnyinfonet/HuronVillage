const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const pjax = require('express-pjax');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 80;

// Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(pjax());

//Parse application /json
app.use(bodyParser.json());

//static files like css and images
app.use(express.static('public'));
/*
app.use((req, res, next) => {
var err = new Error('Page not found');
err.status = 404;
next(err);
})

app.use((err, req, res, next ) => {
    res.status(err.status || 500);
    res.sendStatus(err.status);
});*/

// Templating Engine
app.engine('hbs', exphbs( {extname: '.hbs'}));
app.set('view engine', 'hbs');

// connection pool
const pool = mysql.createPool({

connectionLimit : 100,
host : process.env.DB_HOST,
user : process.env.DB_USER,
password : process.env.DB_PASS,
database : process.env.DB_NAME
});

pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('connected as ID' + connection.threadId);
});



const routes = require('./server/routes/user');
app.use('/', routes);









app.listen(port, () => console.log('Listen on Port ${port}'));
