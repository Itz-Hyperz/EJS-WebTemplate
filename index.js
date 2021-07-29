// Imports
const express = require('express')
const app = express()
const chalk = require('chalk')
const ms = require('ms')
const nodelogger = require('hyperz-nodelogger')
const logger = new nodelogger()

const config = require('./config.js');
const backend = require('./backend.js');
let con;

/* --------------------------------------------------------------------------------------------------------------

If using MySQL you may un-comment this

const { createConnection } = require('mysql') // Imports SQL Module
con = createConnection(config.mysql) // Defines Con Var

try {
    con.connect() // Trys to connect to MySQL Server
} catch(e) {
    console.log(chalk.red(`Something went wrong when trying to connect to MySQL:`, e.stack)) // Logs any error
}

setInterval(() => {
    con.ping() // Pings the SQL Server to avoid timeout
}, ms('25m')) // Pings server every 25 minutes

-------------------------------------------------------------------------------------------------------------- */ 

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation (add pages here)
app.get('', (req, res) => {
    res.render('index.ejs', { backend: backend, config: config, con: con })
})

// Searched the redirects for the page (must be 1 before 404 page)
config.redirects.forEach(element => {
    app.get(`/${element.name}`, (req, res) => {
        res.redirect(element.link);
    });
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs', { backend: backend, config: config, con: con });
});

// Main Logger Event
logger.hypelogger(`ExpressJS`, '500', 'blue', `Domain: ${chalk.blue(config.domain)}\nPort: ${chalk.blue(config.port)}\n\nAuthor: ${chalk.blue(config.ogAuthor)}`, 'disabled', 'blue', 'single', true)

// Port Listening
app.listen(config.port)