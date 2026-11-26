import tokenGenerator from './modules/generateToken.js';
import 'dotenv/config';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPE = process.env.SCOPE;

const generateToken = new tokenGenerator(CLIENT_ID, CLIENT_SECRET, SCOPE);
const thingy = await generateToken.authenticate('.env');
console.log('WAIT');
