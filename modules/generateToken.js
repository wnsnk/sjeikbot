'use strict';
import passport from 'passport';
import { Strategy } from 'passport-twitch-strategy';
import 'dotenv/config';
import express from 'express';
import open from 'open';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPE = process.env.SCOPE;

const app = express();
const port = 3000;

let url = 'https://id.twitch.tv/oauth2/authorize?';
url += new URLSearchParams({
    client_id: CLIENT_ID,
    force_verify: true,
    redirect_uri: 'http://localhost:3000/auth/twitch/callback',
    response_type: 'token',
    scope: SCOPE,
}).toString();

app.use(passport.initialize());

passport.use(
    'twitch',
    new Strategy(
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/twitch/callback',
            scope: SCOPE,
        },
        function (accessToken, refreshToken, profile, done) {
            console.log(accessToken, refreshToken, profile, done);
        },
    ),
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get('/', function (req, res) {
    res.send(`<a href="${url}">${url}</a>`);
});

app.get('/auth/twitch', passport.authenticate('twitch'));
app.get(
    '/auth/twitch/callback',
    passport.authenticate('twitch', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        console.log('test');
        res.redirect('/');
    },
);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

open(url);
