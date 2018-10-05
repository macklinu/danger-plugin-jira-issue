import jiraIssue from './'

declare const global: any

beforeEach(() => {
  global.warn = jest.fn()
  global.message = jest.fn()
})

afterEach(() => {
  global.danger = undefined
  global.warn = undefined
  global.message = undefined
})

test('throws when supplied invalid configuration', () => {
  const anyJira = jiraIssue as any
  expect(() => anyJira()).toThrow()
  expect(() => jiraIssue({} as any)).toThrow()
  expect(() => jiraIssue({ key: 'ABC' } as any)).toThrow()
  expect(() => jiraIssue({ url: 'https://jira.net/browse' } as any)).toThrow()
})

test('warns when PR title is missing JIRA issue key', () => {
  global.danger = createDangerState({ title: 'Change some things' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.warn).toHaveBeenCalledWith(
    'No JIRA keys found in the PR title, branch name, or commit messages (e.g. ABC-123).'
  )
})

test('adds the JIRA issue link to the messages table', () => {
  global.danger = createDangerState({ title: '[ABC-808] Change some things' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
  )
})

test('properly concatenates URL parts (trailing slash in url)', () => {
  global.danger = createDangerState({ title: '[ABC-808] Change some things' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse/',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
  )
})

test('matches JIRA issue anywhere in title', () => {
  global.danger = createDangerState({ title: 'My changes - ABC-123' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>'
  )
})

test('matches lowercase JIRA key in PR title', () => {
  global.danger = createDangerState({ title: '[abc-808] Change some things' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
  )
})

test('supports multiple JIRA keys in PR title', () => {
  global.danger = createDangerState({
    title: '[ABC-123][ABC-456] Change some things',
  })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/ABC-456">ABC-456</a>'
  )
})

test('supports multiple JIRA boards in PR title', () => {
  global.danger = createDangerState({
    title: '[ABC-123][DEF-456] Change some things',
  })
  jiraIssue({
    key: ['ABC', 'DEF'],
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/DEF-456">DEF-456</a>'
  )
})

test('supports a custom format function', () => {
  global.danger = createDangerState({
    title: '[ABC-123][DEF-456] Change some things',
  })
  jiraIssue({
    format(jiraUrls) {
      return `JIRA Tickets: ${jiraUrls.join(', ')}`
    },
    key: ['ABC', 'DEF'],
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    'JIRA Tickets: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/DEF-456">DEF-456</a>'
  )
})

test('supports JIRA key in the git branch', () => {
  global.danger = createDangerState({ branchName: 'ABC-808/some-things' })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
  )
})

test('only reports one unique URL if found in multiple locations', () => {
  global.danger = createDangerState({
    title: '[ABC-100] Some thing',
    branchName: 'abc-100/make-some-thing',
  })
  jiraIssue({
    key: 'ABC',
    url: 'https://jira.net/browse',
  })
  expect(global.message).toHaveBeenCalledWith(
    ':link: <a href="https://jira.net/browse/ABC-100">ABC-100</a>'
  )
})

/** Helper function help set up Danger PR state needed by this plugin. */
function createDangerState({
  title = '',
  branchName = '',
}: {
  title?: string
  branchName?: string
}): any {
  return {
    github: {
      pr: {
        title,
        head: {
          ref: branchName,
        },
      },
    },
  }
}
