'use strict';
import passport from 'passport';
import { Strategy } from 'passport-twitch-strategy';
import 'dotenv/config';
import express from 'express';
import open from 'open';
import writeDotEnvFile from './editDotEnv.js';

export default class tokenGenerator {
    constructor(clientID, clientSecret, scope, port) {
        this.clientID = clientID;
        this.clientSecret = clientSecret;
        this.scope = scope;
        this.port = port;

        this.app = express();
        this.server = this.app.listen(this.port);
        this.authURL = 'https://id.twitch.tv/oauth2/authorize?';
        this.authURL += new URLSearchParams({
            client_id: this.clientID,
            force_verify: true,
            redirect_uri: `http://localhost:${this.port}/auth/twitch/callback`,
            response_type: 'token',
            scope: this.scope,
        }).toString();
        console.log(this);
    }

    authenticate(dotEnvFile) {
        this.app.use(passport.initialize());
        passport.use(
            'twitch',
            new Strategy(
                {
                    clientID: this.clientID,
                    clientSecret: this.clientSecret,
                    callbackURL: `http://localhost:${this.port}/auth/twitch/callback`,
                    scope: this.scope,
                },
                function (accessToken, refreshToken, profile, done) {
                    writeDotEnvFile(dotEnvFile, accessToken, refreshToken);
                },
            ),
        );

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });
        this.app.get('/auth/twitch', passport.authenticate('twitch'));
        this.app.get(
            '/auth/twitch/callback',
            passport.authenticate('twitch', { failureRedirect: '/' }),
            function (req, res) {
                // Successful authentication, redirect home.
                res.redirect('/');
            },
        );
        this.app.listen(this.port, () => {
            console.log(
                `Started authentication on:  http://localhost:${this.port}`,
            );
        });
        open(this.authURL);
    }
}
