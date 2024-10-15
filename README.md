# SpamAutoReporterForMastodon

## Overview
Automatically reports suspicious spam posts that mention your Mastodon account.

## Features
* Automatic reporting of posts
* Automatic blocking of accounts

## Installation
### Code Setup
1. Clone the repository
    1. `$ git clone https://github.com/rettar5/SpamAutoReporterForMastodon.git`
    1. `$ cd SpamAutoReporterForMastodon`
1. Install dependencies
    1. `$ npm i`

### Environment Setup
1. Generate an Access Token from Mastodon (User Settings > Development > New App) with the following permissions:
    * `read:follows`
        * Used to determine if the account is followed
    * `read:notifications`
        * Used to detect mentions
    * `write:blocks`
        * Used for automatic account blocking
    * `write:reports`
        * Used for automatic reporting of posts
1. Copy `.env.template` and create `.env`
    1. `$ cp .env.template .env`
1. Set `URL` and `USER_TOKEN` in `.env`:
    * `URL`: The URL of your Mastodon instance
    * `USER_TOKEN`: The Access Token generated in step 1

## Usage
1. Run the application:
    ```bash
    $ npm run start
    ```

## Configuration
### .env
* `SPAM_REPORTER_TOKEN`
    * If you want to report from a different account than the one in `USER_TOKEN`, specify the Access Token here.
* `REPORT_THRESHOLD_MENTION_COUNT`
    * Set the number of mentions per post required to flag it as spam.
* `REPORT_THRESHOLD_URL_COUNT`
    * Set the number of URLs per post required to flag it as spam.
* `REPORT_COMMENT`
    * Add a comment when reporting a post.
* `SHOULD_BLOCK_SPAM_ACCOUNT`
    * Set to `1` if you want to block the account after reporting.
* `LOG_LEVEL`
    * Set the log level.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
