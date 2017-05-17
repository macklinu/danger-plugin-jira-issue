import jiraIssue from './'

describe('jiraIssue()', () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
  })
  afterEach(() => {
    global.danger = undefined
    global.warn = undefined
    global.message = undefined
  })
  it('throws when supplied invalid configuration', () => {
    expect(() => jiraIssue()).toThrow()
    expect(() => jiraIssue({})).toThrow()
    expect(() => jiraIssue({ key: 'ABC' })).toThrow()
    expect(() => jiraIssue({ url: 'https://jira.net/browse' })).toThrow()
  })
  it('warns when PR title is missing JIRA issue key', () => {
    global.danger = { github: { pr: { title: 'Change some things' } } }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse',
    })
    expect(global.warn).toHaveBeenCalledWith(
      'Please add the JIRA issue key to the PR title (e.g. ABC-123)',
    )
  })
  it('adds the JIRA issue link to the messages table', () => {
    global.danger = {
      github: { pr: { title: '[ABC-808] Change some things' } },
    }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse',
    })
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>',
    )
  })
  it('properly concatenates URL parts (trailing slash in url)', () => {
    global.danger = {
      github: { pr: { title: '[ABC-808] Change some things' } },
    }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse/',
    })
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>',
    )
  })
  it('matches JIRA issue anywhere in title', () => {
    global.danger = { github: { pr: { title: 'My changes - ABC-123' } } }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse',
    })
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>',
    )
  })
  it('does not match lowercase JIRA key in PR title', () => {
    global.danger = {
      github: { pr: { title: '[abc-808] Change some things' } },
    }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse',
    })
    expect(global.warn).toHaveBeenCalled()
  })
  it('honors custom emoji configuration', () => {
    global.danger = { github: { pr: { title: '(ABC-123) Change stuff' } } }
    jiraIssue({
      key: 'ABC',
      url: 'https://jira.net/browse',
      emoji: ':paperclip:',
    })
    expect(global.message).toHaveBeenCalledWith(
      ':paperclip: <a href="https://jira.net/browse/ABC-123">ABC-123</a>',
    )
  })
})
