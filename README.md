# SpamAutoReporterForMastodon

## Overview
Mastodonのアカウントにメンションされたスパムの疑いのある投稿を自動で通報します。

## Features
* 投稿の自動通報
* アカウントの自動ブロック

## Installation
### コード設定
1. リポジトリをclone
    1. `$ git clone https://github.com/rettar5/SpamAutoReporterForMastodon.git`
    1. `$ cd SpamAutoReporterForMastodon`
1. 依存をinstall
    1. `# npm i`

### 環境設定
1. Mastodonの ユーザ設定 > 開発 > 新規アプリ から、以下のアクセス権を持つAccess Tokenを発行
    * `read:accounts`
        * アカウントをフォローしているかの判定に利用
    * `read:notifications`
        * メンションの検知に利用
    * `write:blocks`
        * アカウントの自動ブロックに利用
    * `write:reports`
        * 投稿の自動通報に利用
1. `.env.template` を複製し、 `.env` を作成
    1. `$ cp .env.template .env`
1. `.env` に `URL` と `USER_TOKEN` を設定
    * `URL`
        * MastodonインスタンスのURL
    * `USER_TOKEN`
        * 1で発行したAccess Token

## Usage
1. `$ npm run start`

## Configuration
### .env
* `SPAM_REPORTER_TOKEN`
    * `USER_TOKEN` とは別のアカウントで通報を行う場合は、 `SPAM_REPORTER_TOKEN` にAccess Tokenを指定します
* `REPORT_THRESHOLD_MENTION_COUNT`
    * スパム判定となる1投稿あたりのメンション数を変更する場合は、 `REPORT_THRESHOLD_MENTION_COUNT` を指定します
* `REPORT_THRESHOLD_URL_COUNT`
    * スパム判定となる1投稿あたりのURL数を変更する場合は、 `REPORT_THRESHOLD_URL_COUNT` を指定します。
* `REPORT_COMMENT`
    * 通報時のコメントを指定する場合は、 `REPORT_COMMENT` を指定します。
* `SHOULD_BLOCK_SPAM_ACCOUNT`
    * 通報後にアカウントをブロックする場合は、 `SHOULD_BLOCK_SPAM_ACCOUNT` に `1` を指定します。
* `LOG_LEVEL`
    * ログレベルを変更する場合は、`LOG_LEVEL` を指定します。

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
