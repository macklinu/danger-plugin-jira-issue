import { resolve } from 'url'

export interface Options {
  /**
   * The JIRA issue key(s) (e.g. the ABC in ABC-123).
   * Supports multiple JIRA projects (e.g. `['ABC', 'DEF']`).
   */
  key: string | string[]
  /** The JIRA instance issue base URL (e.g. https://jira.atlassian.com/browse/). */
  url: string
  /**
   * The emoji to display with the JIRA issue link.
   * See the possible emoji values, listed as keys in the
   * [GitHub API `/emojis` response](https://api.github.com/emojis).
   * Defaults to `':link:'`.
   */
  emoji?: string
  /**
   * A format function to format the message
   * @param {string} emoji
   * @param {string[]} jiraUrls
   * @returns {string}
   */
  format?: (emoji: string, jiraUrls: string[]) => string
  /**
   * The location of the JIRA issue, either the PR title, or the git branch
   * Defaults to `title`
   */
  location?: 'title' | 'branch'
}

const link = (href: string, text: string): string =>
  `<a href="${href}">${text}</a>`

const ensureUrlEndsWithSlash = (url: string) => {
  if (!url.endsWith('/')) {
    return url.concat('/')
  }
  return url
}

/**
 * A Danger plugin to add a JIRA issue link to the Danger pull request comment.
 * If a pull request title does not contain the supplied JIRA issue identifier (e.g. ABC-123),
 * then Danger will comment with a warning on the pull request asking the developer
 * to include the JIRA issue identifier in the pull request title.
 */
export default function jiraIssue(options: Options) {
  const { key = '', url = '', emoji = ':link:', location = 'title' } =
    options || {}
  if (!url) {
    throw Error(`'url' missing - must supply JIRA installation URL`)
  }
  if (!key) {
    throw Error(`'key' missing - must supply JIRA issue key`)
  }

  // Support multiple JIRA projects.
  const keys = Array.isArray(key) ? `(${key.join('|')})` : key

  const jiraKeyRegex = new RegExp(`(${keys}-[0-9]+)`, 'g')
  let match
  const jiraIssues = []
  // tslint:disable-next-line:no-conditional-assignment
  let jiraLocation
  switch (location) {
    case 'title': {
      jiraLocation = danger.github.pr.title
      break
    }
    case 'branch': {
      jiraLocation = danger.github.pr.head.ref
      break
    }
    default: {
      throw Error(
        `Invalid value for 'location', must be either "title" or "branch"`
      )
    }
  }
  match = jiraKeyRegex.exec(jiraLocation)
  while (match != null) {
    jiraIssues.push(match[0])
    match = jiraKeyRegex.exec(jiraLocation)
  }
  if (jiraIssues.length > 0) {
    const jiraUrls = jiraIssues.map(issue =>
      link(resolve(ensureUrlEndsWithSlash(url), issue), issue)
    )

    // use custom formatter, or default
    if (options.format) {
      message(options.format(emoji, jiraUrls))
    } else {
      message(`${emoji} ${jiraUrls.join(', ')}`)
    }
  } else {
    const firstKey = Array.isArray(key) ? key[0] : key
    warn(
      `Please add the JIRA issue key to the PR ${location} (e.g. ${firstKey}-123)`
    )
  }
}
