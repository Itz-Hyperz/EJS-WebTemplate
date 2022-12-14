// Basic Imports
const config = require("./config.json");
const express = require("express");
const app = express();
const chalk = require('chalk');

// MySQL Setup
const mysql = require('mysql');
config.sql.charset = "utf8mb4";
let con = mysql.createConnection(config.sql); // set = 0 to disable

// Backend Initialization
const backend = require('./backend.js');
backend.init(app, con);

// Discord Login Passport
const passport = require('passport');
const DiscordStrategy = require('passport-discord-faxes').Strategy;
passport.serializeUser(function(user, done) { done(null, user) });
passport.deserializeUser(function(obj, done) { done(null, obj) });
passport.use(new DiscordStrategy({
    clientID: config.discord.oauthId,
    clientSecret: config.discord.oauthToken,
    callbackURL: `${(config.domain.endsWith('/') ? config.domain.slice(0, -1) : config.domain)}/auth/discord/callback`,
    scope: ['identify', 'guilds', 'email'],
    prompt: 'consent'
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

// Routing
app.get('', async function(req, res) {
    res.render('index.ejs', { loggedIn: req.isAuthenticated() });
});

app.get('/account', backend.checkAuth, async function(req, res) {
    res.render('account.ejs', { user: req.session.passport.user });
});

app.get('/discorduserdata', backend.checkAuth, async function(req, res) {
    res.type('json').send(JSON.stringify(req.session.passport.user, null, 4) + '\n');
});

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/'}), async function(req, res) {
    req.session?.loginRef ? res.redirect(req.session.loginRef) : res.redirect('/');
    delete req.session?.loginRef
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs');
});

// Server Initialization
app.listen(config.port)
console.log(chalk.blue('ExpressJS Web Application Started on Port ' + config.port));

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(config.debugMode) console.log(chalk.red(err));
});
