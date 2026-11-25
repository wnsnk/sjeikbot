'use strict';

import * as fs from 'fs';
/**
 * Updates the .env file with new User Access and Refresh Tokens.
 * @param {string} dotEnvFile - The location of the dotEnvFile.
 * @param {string} userAccesToken - The new User Access Token.
 * @param {string} refreshToken - The new Refresh Token.
 */
export default function writeDotEnvFile(
    dotEnvFile,
    userAccesToken,
    refreshToken,
) {
    const dotenvFile = fs.readFileSync(dotEnvFile).toString().split('\n');
    const updatedDotEnvArray = [];
    for (let line of dotenvFile) {
        if (line.startsWith('USER_ACCESS_TOKEN')) {
            line = `USER_ACCESS_TOKEN = '${userAccesToken}'`;
        } else if (line.startsWith('REFRESH_TOKEN')) {
            line = `REFRESH_TOKEN = '${refreshToken}'`;
        }
        updatedDotEnvArray.push(line);
    }
    fs.writeFileSync(dotEnvFile, updatedDotEnvArray.join('\n'));
}
