# danger-plugin-jira-issue

[![Build Status](https://travis-ci.org/macklinu/danger-plugin-jira-issue.svg?branch=master)](https://travis-ci.org/macklinu/danger-plugin-jira-issue)
[![npm version](https://badge.fury.io/js/danger-plugin-jira-issue.svg)](https://badge.fury.io/js/danger-plugin-jira-issue)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[Danger](https://github.com/danger/danger-js) plugin to link JIRA issue in pull request

## Usage

Install:

```sh
yarn add danger-plugin-jira-issue --dev
```

At a glance:

```js
// dangerfile.js
import jiraIssue from 'danger-plugin-jira-issue'

jiraIssue({
  key: 'JIRA',
  url: 'https://myjira.atlassian.net/browse',
  emoji: ':paperclip:',
})
```

See the [documentation](https://doc.esdoc.org/github.com/macklinu/danger-plugin-jira-issue/) for detailed information .

## Development

Install [Yarn](https://yarnpkg.com/en/), and install the dependencies - `yarn install`.

Run the [Jest](https://facebook.github.io/jest/) test suite with `yarn test`.

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated NPM package publishing.

The main caveat: instead of running `git commit`, run `yarn commit` and follow the prompts to input a conventional changelog message via [commitizen](https://github.com/commitizen/cz-cli).

:heart:
