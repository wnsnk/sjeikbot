'use strict';

import * as fs from 'fs';

export default function writeDotEnvFile(dotEnvFile, userAccesToken) {
    const dotenvFile = fs.readFileSync(dotEnvFile).toString().split('\n');
    const updatedDotEnvArray = [];
    for (let line of dotenvFile) {
        if (line.startsWith('USER_ACCESS_TOKEN')) {
            line = `USER_ACCESS_TOKEN = '${userAccesToken}'`;
        }
        updatedDotEnvArray.push(line);
    }
    fs.writeFileSync(dotEnvFile, updatedDotEnvArray.join('\n'));
}
