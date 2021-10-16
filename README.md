# Phishing Spammer
A simple script which sends fake username/email and passwords to a phishing website in order to flood it with useless data.  

# Disclaimer
This script simply sends the request from your machine and does **not** attempt to mask the source IP.  

# Environment Variables
This script supports the following environment variables to allow you to modify the behaviour.

| Environment Variable | Description | Example | Default Value |
| --- | --- | :-: | :-: |
| `REQUEST_URL` | **Required.** <br /> URL to send the `POST` request to. | `https://discord-jobs.net` | None |
| `REQUEST_TIMEOUT` | Time (in milliseconds) to wait before timing the request out. | `5000` | `10000` |
| `REQUEST_COOKIE` | Cookie to be sent along each request. | `PHPSESSID=qiio0` | None |
| `USERNAME_METHOD` | Whether to send username as **username** or **email**. <br /> Email works by appending random email domain to the end of username. | `email` | `username` |
| `USERNAME_KEY` | Key of the username field in the payload. <br /> Set this to `email` or leave it blank for email if `USERNAME_METHOD` is set to `email`. <br /> <br /> e.g. Setting as `user` results in: `{ "user": "potato" }` | `user` | `username` |
| `PASSWORD_KEY` | Key of the password field in the payload. <br /> <br /> e.g. Setting as `pw` results in: `{ "pw": "P@ssword" }` | `pw` | `password` |
| `USERNAME_LEET_CHANCE` | Chance to _leetify_ the characters in username. <br /> Increases variety of the username sent. <br /> <br /> e.g. `E` => `3` | `0` | `0.2` |
| `USERNAME_PREFIX_LENGTH` | Random amount of characters between 0 and value specified (inclusive) to append to the start of usernames. | `5` | `0`
| `USERNAME_SUFFIX_LENGTH` | Random amount of characters between 0 and value specified (inclusive) to append to the end of usernames. | `5` | `3`
| `PASSWORD_LENGTH_MIN` | The minimum amount of characters in the randomly generated password. | `5` | `8` |
| `PASSWORD_LENGTH_MAX` | The maximum amount of characters in the randomly generated password. | `10` | `16` |
| `REQUEST_INTERVAL_DELAY_MIN` | The minimum delay (in milliseconds) between each request. <br /> This is useful for preventing sending too many requests too quickly. | `10000` | `5000` |
| `REQUEST_INTERVAL_DELAY_MAX` | The maximum delay (in milliseconds) between each request. | `20000` | `10000` |
| `REQUEST_TMR_DELAY_START` | The initial delay (in milliseconds) when [`HTTP 429 Too Many Requests`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) is received. | `60000` | `600000` <br /> (10 minutes) |
| `REQUEST_TMR_DELAY_START` | The incremental delay (in milliseconds) when [`HTTP 429 Too Many Requests`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) is received. <br /> This is added incrementally upon each sequential HTTP 429 is received. | `60000` | `60000` <br /> (1 minute) |

# Instructions
To run this script, set the variables before either using Docker Compose or running `npm start`.
