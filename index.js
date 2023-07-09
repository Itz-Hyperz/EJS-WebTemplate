// Basic Imports
const config = require("./config.json");
const express = require("express");
const app = express();
const chalk = require('chalk');
const utils = require('hyperz-utils');
const bcrypt = require('bcrypt');

// MySQL Setup
const mysql = require('mysql');
config.sql.charset = "utf8mb4";
let con = mysql.createConnection(config.sql); // set = 0 to disable

// Backend Initialization
const backend = require('./backend.js');
backend.init(app, con);

// Passport Initialization
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function(user, done) { done(null, user) });
passport.deserializeUser(function(obj, done) { done(null, obj) });
passport.use(new LocalStrategy({ usernameField: 'email' }, backend.authenticateUserLocal))

if(config.discord.enabled) {
    const DiscordStrategy = require('passport-discord-hyperz').Strategy;
    passport.use(new DiscordStrategy({
        clientID: config.discord.oauthId,
        clientSecret: config.discord.oauthToken,
        callbackURL: `${(config.domain.endsWith('/') ? config.domain.slice(0, -1) : config.domain)}/auth/discord/callback`, // THIS IS THE CALLBACK URL
        scope: ['identify', 'guilds', 'email'],
        prompt: 'consent'
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));
    app.get('/auth/discord', passport.authenticate('discord'));
    app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/'}), async function(req, res) {
        req.session?.loginRef ? res.redirect(req.session.loginRef) : res.redirect('/');
        delete req.session?.loginRef
    });
};

// Routing
app.get('', async function(req, res) {
    backend.resetAppLocals(app);
    res.render('index.ejs');
});

app.get('/login', backend.checkNotAuth, async function(req, res) {
    backend.resetAppLocals(app);
    res.render('login.ejs');
});

app.get('/cookies', async function(req, res) {
    await backend.resetAppLocals(app);
    res.render('cookies.ejs');
});

app.get('/privacy', async function(req, res) {
    await backend.resetAppLocals(app);
    res.render('privacy.ejs');
});

app.get('/account', backend.checkAuth, async function(req, res) {
    backend.resetAppLocals(app);
    res.render('account.ejs', { user: req.user });
});

// YOU SHOULD DELETE THIS BEFORE PRODUCTION BUILD
app.get('/userdata', backend.checkAuth, async function(req, res) {
    backend.resetAppLocals(app);
    res.type('json').send(JSON.stringify(req.user, null, 4) + '\n');
});

app.post('/register', backend.checkNotAuth, async (req, res) => {
    await backend.resetAppLocals(app);
    for(let name of Object.keys(req.body)) {
        req.body[name] = await utils.sanitize(req.body[name]);
    };
    try {
        let userid = await backend.generateUserId(7);
        let hashedPassword = await bcrypt.hash(req.body.password, 13);
        con.query(`SELECT * FROM users WHERE email="${req.body.email}"`, async function (err, row) {
            if(err) throw err;
            if(!row[0]) {
                con.query(`SELECT * FROM sitesettings`, async function(err, row) {
                    if(err) throw err;
                    if(!row[0]) return console.log('No site settings found.');
                    con.query(`INSERT INTO users (id, email, password) VALUES ("${userid}", "${req.body.email}", "${hashedPassword}")`, async function (err, row) {
                        if(err) throw err;
                    });
                    res.redirect('/login')
                });
            } else {
                res.redirect('/login')
            };
        });
    } catch {
        res.redirect('/register')
    };
});

app.post('/backend/update/password', backend.checkAuth, async function(req, res) {
    await backend.resetAppLocals(app);
    if(req.body.password !== req.body.confpassword) return res.send('Your passwords do not match...');
    let hashedPassword = await bcrypt.hash(req.body.confpassword, 13);
    con.query(`SELECT * FROM users WHERE id="${req.user.id}"`, async function(err, row) {
        if(err) throw err;
        con.query(`UPDATE users SET password="${hashedPassword}" WHERE id="${req.user.id}"`, function(err, row) { if(err) throw err; });
        req.logout(function(err) {
            if(err) { return next(err); }
        });
        res.redirect('/login');
    });
});

app.post('/auth/local', backend.checkNotAuth, passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login',
    failureFlash: true
}));

config.ownerIds.forEach(function(item) {
    if(item != 'YOUR_USER_ID') {
        con.query(`INSERT INTO staff (userid) VALUES ("${item}")`, function(err, row) {
            if(err) throw err;
        });
    };
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs');
});

// Server Initialization
app.listen(config.port)

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(config.debugMode) console.log(chalk.red(err));
});
