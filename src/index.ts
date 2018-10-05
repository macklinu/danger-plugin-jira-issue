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
   * A format function to format the message
   * @param {string[]} jiraUrls
   * @returns {string}
   */
  format?: (jiraUrls: string[]) => string
}

function link(href: string, text: string): string {
  return `<a href="${href}">${text}</a>`
}

function ensureUrlEndsWithSlash(url: string): string {
  return url.endsWith('/') ? url : url.concat('/')
}

const defaultFormat = (urls: string[]) => `:link: ${urls.join(', ')}`

/**
 * A Danger plugin to add a JIRA issue link to the Danger pull request comment.
 * If a pull request title does not contain the supplied JIRA issue identifier (e.g. ABC-123),
 * then Danger will comment with a warning on the pull request asking the developer
 * to include the JIRA issue identifier in the pull request title.
 */
export default function jiraIssue(
  { key, url, format = defaultFormat }: Options = {} as Options
) {
  if (!url) {
    throw Error(`'url' missing - must supply JIRA installation URL`)
  }
  if (!key) {
    throw Error(`'key' missing - must supply JIRA issue key`)
  }

  function findMatches(property: string): string[] {
    const issues: string[] = []

    let match = jiraKeyRegex.exec(property)
    while (match !== null) {
      issues.push(match[0].toLowerCase())
      match = jiraKeyRegex.exec(property)
    }

    return issues
  }

  // Support multiple JIRA projects.
  const keys = Array.isArray(key) ? `(${key.join('|')})` : key

  const jiraKeyRegex = new RegExp(`(${keys}-[0-9]+)`, 'gi')

  const allIssues = new Set([
    ...findMatches(danger.github.pr.title),
    ...findMatches(danger.github.pr.head.ref),
  ])

  if (allIssues.size > 0) {
    // URL must end with a slash before attempting to fully resolve the JIRA URL.
    url = ensureUrlEndsWithSlash(url)
    const jiraUrls = Array.from(allIssues).map(issue => {
      const formattedIssue = issue.toUpperCase()
      const resolvedUrl = resolve(url, formattedIssue)
      return link(resolvedUrl, formattedIssue)
    })
    message(format(jiraUrls))
  } else {
    const warningMessage = `No JIRA keys found in the PR title, branch name, or commit messages (e.g. ${key}-123).`
    warn(warningMessage)
  }
}
