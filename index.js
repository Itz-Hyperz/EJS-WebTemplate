// Imports
const express = require('express')
const app = express()
const chalk = require('chalk')
const nodelogger = require('hyperz-nodelogger')
const logger = new nodelogger()
const config = require('./config.js');
const backend = require('./backend.js');

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation (add pages here)
app.get('', (req, res) => {
    res.render('index.ejs', { backend: backend, config: config })
})

// Searched the redirects for the page (must be 1 before 404 page)
config.redirects.forEach(element => {
    app.get(`/${element.name}`, (req, res) => {
        res.redirect(element.link);
    });
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs', { config: config, backend: backend });
});

// Main Logger Event
logger.hypelogger(`ExpressJS`, '500', 'blue', `Domain: ${chalk.blue(config.domain)}\nPort: ${chalk.blue(config.port)}\n\nAuthor: ${chalk.blue(config.ogAuthor)}`, 'disabled', 'blue', 'single', true)

// Port Listening
app.listen(config.port)