import { join } from 'path'

const link = (href, text) => `<a href="${href}">${text}</a>`

/**
 * A Danger plugin to add a JIRA issue link to the Danger pull request comment.
 * If a pull request title does not contain the supplied JIRA issue identifier (e.g. ABC-123),
 * then Danger will comment with a warning on the pull request asking the developer
 * to include the JIRA issue identifier in the pull request title.
 *
 * @param {Object} options - The JIRA options object.
 * @param {string} options.key - The JIRA issue key (e.g. the ABC in ABC-123).
 * @param {string} options.url - The JIRA instance issue base URL (e.g. https://jira.atlassian.com/browse/).
 * @param {string} [options.emoji=':link:'] - The emoji to display with the JIRA issue link.
 * See the possible emoji values, listed as keys in the [GitHub API `/emojis` response](https://api.github.com/emojis).
 */
export default function jiraIssue({ key, url, emoji = ':link:' } = {}) {
  if (!url) throw Error(`'url' missing - must supply JIRA installation URL`)
  if (!key) throw Error(`'key' missing - must supply JIRA issue key`)

  const jiraKeyRegex = new RegExp(`^.*(${key}-[0-9]+).*$`, 'g')
  const match = jiraKeyRegex.exec(danger.github.pr.title)
  if (match) {
    const jiraIssue = match[1]
    const jiraUrl = link(join(url, jiraIssue), jiraIssue)
    message(`${emoji} ${jiraUrl}`)
  } else {
    warn(`Please add the JIRA issue key to the PR title (e.g. ${key}-123)`)
  }
}
