'use strict';
import passport from 'passport';
import { Strategy } from 'passport-twitch-strategy';
import 'dotenv/config';
import express from 'express';
import open from 'open';
import writeDotEnvFile from './editDotEnv.js';

/**
 * Handles authorization for user access tokens.
 * @param {string} clientID - Twitch Client ID.
 * @param {string} clientSecret - Twitch Client SECRET.
 * @param {string} scope - The scope of the bot: 'user:bot user:read:chat user:write:chat'
 * @param {number} port - The port used for authentication. Default: 3000
 */
export default class tokenGenerator {
    constructor(clientID, clientSecret, scope, port = 3000) {
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
    }
    /**
     * Opens browser and asks user to authorize. If succesfull it updates the .env file with a new access token.
     * @param {string} dotEnvFile - The location of the .env file
     */
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
                    console.log(
                        `Succes! The bot is authorised by ${profile.login}`,
                    );
                    this.closeServer();
                }.bind(this),
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
    /**
     * Closes the server started by the authentication process.
     */
    closeServer() {
        this.server.close();
        console.log(`Server for authentication at port: ${this.port} closed.`);
    }
}
