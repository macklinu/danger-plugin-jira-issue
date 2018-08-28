import jiraIssue from "./";

declare const global: any;

describe("jiraIssue()", () => {
  beforeEach(() => {
    global.warn = jest.fn();
    global.message = jest.fn();
  });
  afterEach(() => {
    global.danger = undefined;
    global.warn = undefined;
    global.message = undefined;
  });
  it("throws when supplied invalid configuration", () => {
    const anyJira = jiraIssue as any;
    expect(() => anyJira()).toThrow();
    expect(() => jiraIssue({} as any)).toThrow();
    expect(() => jiraIssue({ key: "ABC" } as any)).toThrow();
    expect(() =>
      jiraIssue({ url: "https://jira.net/browse" } as any)
    ).toThrow();
  });
  it("warns when PR title is missing JIRA issue key", () => {
    global.danger = { github: { pr: { title: "Change some things" } } };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.warn).toHaveBeenCalledWith(
      "Please add the JIRA issue key to the PR title (e.g. ABC-123)"
    );
  });
  it("adds the JIRA issue link to the messages table", () => {
    global.danger = {
      github: { pr: { title: "[ABC-808] Change some things" } }
    };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
    );
  });
  it("properly concatenates URL parts (trailing slash in url)", () => {
    global.danger = {
      github: { pr: { title: "[ABC-808] Change some things" } }
    };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse/"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
    );
  });
  it("matches JIRA issue anywhere in title", () => {
    global.danger = { github: { pr: { title: "My changes - ABC-123" } } };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>'
    );
  });
  it("does not match lowercase JIRA key in PR title", () => {
    global.danger = {
      github: { pr: { title: "[abc-808] Change some things" } }
    };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.warn).toHaveBeenCalled();
  });
  it("honors custom emoji configuration", () => {
    global.danger = { github: { pr: { title: "(ABC-123) Change stuff" } } };
    jiraIssue({
      emoji: ":paperclip:",
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':paperclip: <a href="https://jira.net/browse/ABC-123">ABC-123</a>'
    );
  });
  it("supports multiple JIRA keys in PR title", () => {
    global.danger = {
      github: { pr: { title: "[ABC-123][ABC-456] Change some things" } }
    };
    jiraIssue({
      key: "ABC",
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/ABC-456">ABC-456</a>'
    );
  });
  it("supports multiple JIRA boards in PR title", () => {
    global.danger = {
      github: { pr: { title: "[ABC-123][DEF-456] Change some things" } }
    };
    jiraIssue({
      key: ["ABC", "DEF"],
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/DEF-456">DEF-456</a>'
    );
  });
  it("supports a custom format function", () => {
    global.danger = {
      github: { pr: { title: "[ABC-123][DEF-456] Change some things" } }
    };
    jiraIssue({
      format: (emoji, jiraUrls) => {
        return `${emoji} JIRA Tickets: ${jiraUrls.join(", ")}`;
      },
      key: ["ABC", "DEF"],
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: JIRA Tickets: <a href="https://jira.net/browse/ABC-123">ABC-123</a>, <a href="https://jira.net/browse/DEF-456">DEF-456</a>'
    );
  });
  it("supports JIRA key in the git branch", () => {
    global.danger = {
      github: { pr: { head: { ref: "ABC-808/some-things" } } }
    };
    jiraIssue({
      key: "ABC",
      location: "branch",
      url: "https://jira.net/browse"
    });
    expect(global.message).toHaveBeenCalledWith(
      ':link: <a href="https://jira.net/browse/ABC-808">ABC-808</a>'
    );
  });
});
