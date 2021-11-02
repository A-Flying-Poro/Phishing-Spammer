import fetch, {Response} from "node-fetch";
import {URLSearchParams} from "url";
import {promisify} from "util";
import {AbortSignal} from "node-fetch/externals";

const usernames = require('../data/usernames.json');

const requestUrl = process.env.REQUEST_URL;
const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '') || 10_000;
const requestCookie = process.env.REQUEST_COOKIE;

const [usernamePrefixLength, usernameSuffixLength] = [
    parseInt(process.env.USERNAME_PREFIX_LENGTH || '') || 0,
    parseInt(process.env.USERNAME_SUFFIX_LENGTH || '') || 3];
const [passwordLengthMin, passwordLengthMax] = [
    parseInt(process.env.PASSWORD_LENGTH_MIN || '') || 8,
    parseInt(process.env.PASSWORD_LENGTH_MAX || '') || 16,
];

const [intervalDelayMin, intervalDelayMax] = [
    parseInt(process.env.REQUEST_INTERVAL_DELAY_MIN || '') || 5_000,
    parseInt(process.env.REQUEST_INTERVAL_DELAY_MAX || '') || 10_000
];
const [backoffInitial, backoffIncrement] = [
    parseInt(process.env.REQUEST_TMR_DELAY_START || '') || 10 * 60_000,
    parseInt(process.env.REQUEST_TMR_DELAY_INCREMENT || '') || 60_000
];

// Set how likely to leetify the username, e.g.. converting E => 3, A => 4
// Increase variety of username sent
const leetChance = parseFloat(process.env.USERNAME_LEET_CHANCE || '') || 0.2;

// Either "username" (default) or "email"
// Email appends a random email domain to the end of usernames
const usernameMethod = process.env.USERNAME_METHOD || 'username';

// The keys used in the payload to send to the website
const [keyUsername, keyPassword] = [
    process.env.USERNAME_KEY || (
        // Default username key = "username"
        process.env.USERNAME_METHOD == undefined ? 'username' :
            // Set the username key to "email" if USERNAME_METHOD is email,
            // Otherwise it'll default to "username"
            process.env.USERNAME_METHOD.toLowerCase() == 'email' ? 'email' : 'username'
    ),
    process.env.PASSWORD_KEY || 'password'
];

const wait = promisify(setTimeout);

async function main() {
    if (requestUrl == undefined) {
        console.log('URL not provided. Please set the URL to send the request to using REQUEST_URL environment variable.');
        return;
    }

    try {
        let loopCount = 0;
        let backoffTime = 0;

        console.log(`Sending to: ${requestUrl}`);

        while (true) {
            console.log(`Loop: ${loopCount}`);

            const timerName = 'Request';
            console.time(timerName);

            const abortController = new AbortController();
            const abortSignal: AbortSignal = abortController.signal as AbortSignal
            const abortTimeoutId = setTimeout(() => abortController.abort(), requestTimeout);

            // const username = generateEmail();
            const username = usernameMethod.toLowerCase() == 'email' ? generateEmail() : generateUsername();
            const password = generatePassword(passwordLengthMin, passwordLengthMax);

            const payload = new URLSearchParams();
            payload.append(keyUsername, username);
            payload.append(keyPassword, password);

            console.log(`Sending payload:`, payload);

            let response: Response | null = null;
            let errored = false;
            try {
                const headers: any = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
                };
                if (requestCookie != undefined)
                    headers['Cookie'] = requestCookie;

                response = await fetch(requestUrl, {
                    method: 'POST',
                    body: payload,
                    headers: headers,
                    redirect: 'manual', // Prevents following Redirect 302
                    signal: abortSignal
                });
            } catch (e) {
                // Only catching AbortError created by the AbortController
                if (e instanceof Error && e.name == 'AbortError') {
                    console.log('Timed out waiting for response, ignoring request.')
                    errored = true;
                } else {
                    throw e;
                }
            } finally {
                console.timeEnd(timerName);
            }

            clearTimeout(abortTimeoutId);
            if (response != null) {
                console.log(`Response: HTTP ${response.status}`);
                /*console.log('Headers: ', response.headers);
                const content = await response.text()
                console.log('Body: ', content)*/
            }

            if (response?.status == 429) {
                // Too many requests
                console.log(`Received 429 Too Many Request response code, waiting it out...`);
                backoffTime = backoffTime == 0 ? backoffInitial : backoffTime + backoffIncrement;
                console.log(`Backing off for ${backoffTime / 1000}s...`);
                await wait(backoffTime);
            } else {
                backoffTime = 0;
                const waitTime = getRandomInt(intervalDelayMin, intervalDelayMax);
                console.log(`Waiting for ${waitTime}ms...`);
                await wait(waitTime);
            }

            console.log()
            console.log()

            loopCount++;
        }
    } catch (e) {
        console.error('An error has occurred while executing main loop:', e);
    }
}

function leetify(string: string) {
    function replaceCharAt(string: string, position: number, replacement: string): string {
        const chance = Math.random();
        if (chance > leetChance) return string;
        else return string.substring(0, position) + replacement + string.substring(position + 1);
    }

    for (let i = 0; i < string.length; i++) {
        const c = string.charAt(i).toLowerCase();

        switch (c) {
            case 'a':
                string = replaceCharAt(string, i, '4');
                break;
            case 'b':
                string = replaceCharAt(string, i, '8');
                break;
            case 'e':
                string = replaceCharAt(string, i, '3');
                break;
            case 'g':
                string = replaceCharAt(string, i, '6');
                break;
            case 'l':
                string = replaceCharAt(string, i, '1');
                break;
            case 'o':
                string = replaceCharAt(string, i, '0');
                break;
            case 'p':
                string = replaceCharAt(string, i, '9');
                break;
            case 's':
                string = replaceCharAt(string, i, '5');
                break;
            case 't':
                string = replaceCharAt(string, i, '7');
                break;
            case 'z':
                string = replaceCharAt(string, i, '2');
                break;
        }
    }
    return string;
}

function generateEmail(): string {
    const domains = ['yahoo.com', 'gmail.com', 'hotmail.com', 'apple.com'];
    const username = generateUsername();

    const domain = domains[getRandomInt(0, domains.length)];
    return `${username}@${domain}`;
}

function generateUsername(): string {
    let username = '';

    const prefixLength = getRandomInt(0, usernamePrefixLength + 1);
    const suffixLength = getRandomInt(0, usernameSuffixLength + 1);

    for (let prefixCurrent = 0; prefixCurrent < prefixLength; prefixCurrent++) {
        username += generateRandomCharacter();
    }
    username += usernames[getRandomInt(0, usernames.length)];
    for (let suffixCurrent = 0; suffixCurrent < suffixLength; suffixCurrent++) {
        username += generateRandomCharacter();
    }

    username = leetify(username);

    return username;
}

function generateRandomCharacter(): string {
    const characters = '1234567890';
    return characters.charAt(getRandomInt(0, characters.length));
}

function generatePassword(lengthMin: number, lengthMax: number = lengthMin): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*';
    const length = getRandomInt(lengthMin, lengthMax);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(getRandomInt(0, characters.length))
    }
    return password;
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

main().catch(console.error);
