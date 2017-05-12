import jiraIssue from './'

jiraIssue({
  key: 'JIRA',
  url: 'https://my.jira.com/browse'
})

jiraIssue({
  key: 'JIRA',
  url: 'https://my.jira.com/browse',
  emoji: ':dancer:'
})

// typings:expect-error
jiraIssue()

// typings:expect-error
jiraIssue({})

// typings:expect-error
jiraIssue({})
