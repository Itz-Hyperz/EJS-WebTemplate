// Imports
const express = require('express')
const app = express()
const config = require('./config.json')
const port = config.main.port

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/images'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation
app.get('', (req, res) => {
    res.render('index', { text: 'Hey' })
})

app.get('/about', (req, res) => {
   res.render('about', { text: 'Hey'})
})


// Port Listening
app.listen(port, () => console.info(`App listening on port ${port}`))