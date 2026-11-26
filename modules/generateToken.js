'use strict';
import passport from 'passport';
import { Strategy } from 'passport-twitch-strategy';
import 'dotenv/config';
import express from 'express';
import open from 'open';
import writeDotEnvFile from './editDotEnv.js';
import session from 'express-session';
/**
 * Handles authorization for user access tokens.
 * @param {string} clientID - Twitch Client ID.
 * @param {string} clientSecret - Twitch Client SECRET.
 * @param {string} scope - The scope of the bot EXAMPLE: 'user:bot user:read:chat user:write:chat'
 * @param {number} port - The port used for authentication. Default: 3000
 */
export default class tokenGenerator {
    constructor(clientID, clientSecret, scope, port = 3000) {
        this.clientID = clientID;
        this.clientSecret = clientSecret;
        this.scope = scope;
        this.port = port;
        this.authenticated = false;

        this.app = express();
        this.server = this.app.listen(this.port);
        this.authURL = 'https://id.twitch.tv/oauth2/authorize?';
        this.authURL += new URLSearchParams({
            client_id: this.clientID,
            force_verify: true,
            redirect_uri: `http://localhost:${this.port}/auth/twitch`,
            response_type: 'token',
            scope: this.scope,
        }).toString();
    }
    /**
     * Opens browser and asks user to authorize. If succesfull it updates the .env file with a new access token.
     * @param {string} dotEnvFile - The location of the .env file
     */
    async authenticate(dotEnvFile) {
        return new Promise((resolve, reject) => {
            this.app.use(
                session({
                    secret: 'secret',
                    resave: false,
                    saveUninitialized: false,
                }),
            );
            this.app.use(passport.initialize());
            this.app.use(passport.session());
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
                        console.log(
                            `Succes! Bot authenticated by: ${profile.login}`,
                        );
                        this.authenticated = true;
                        done(null, profile);
                        resolve(profile);
                    }.bind(this),
                ),
            );

            passport.serializeUser(function (user, done) {
                done(null, user);
            });

            passport.deserializeUser(function (user, done) {
                done(null, user);
            });
            this.app.get('/', (req, res) => {
                if (!this.authenticated) {
                    res.send(`<a href=${this.authURL}>Authenticate</a>`);
                } else {
                    res.send('Already authenticated');
                }
            });
            this.app.get(
                '/auth/twitch',
                passport.authenticate('twitch'),
                function (req, res) {
                    console.log('auth/twitch');
                },
            );
            this.app.get(
                '/auth/twitch/callback',
                passport.authenticate('twitch', { failureRedirect: '/' }),
                function (req, res) {
                    console.log('callback');
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
        });
    }
    /**
     * Closes the server started by the authentication process.
     */
    closeServer() {
        this.server.close();
        console.log(`Server for authentication at port: ${this.port} closed.`);
    }
}
