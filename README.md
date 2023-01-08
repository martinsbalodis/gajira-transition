# Jira Transition

Transition Jira issue

> ##### Only supports Jira Cloud. Does not support Jira Server (hosted)

## Usage

> ##### Note: this action requires [Jira Login Action](https://github.com/marketplace/actions/jira-login)

![Issue Transition](../assets/example.gif?raw=true)

Example transition action:

```yaml
- name: Transition issue
  id: transition
  uses: martinsbalodis/gajira-transition@master
  with:
    issue: GA-181
    transition: "In progress"
    newRelease: "My Release 1.0.2"
}
```

The `issue` parameter can be an issue id created or retrieved by an upstream action – for example, [`Create`](https://github.com/marketplace/actions/jira-create) or [`Find Issue Key`](https://github.com/marketplace/actions/jira-find). Here is full example workflow:

```yaml
on:
  push

name: Test Transition Issue

jobs:
  test-transition-issue:
    name: Transition Issue
    runs-on: ubuntu-latest
    steps:
    - name: Login
      uses: atlassian/gajira-login@v3
      env:
        JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
        JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
        JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        
    - name: Create new issue
      id: create
      uses: atlassian/gajira-create@v3

    - name: create version for release
      id: tag_version
      uses: mathieudutour/github-tag-action@v6.1
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        release_branches: master
        default_bump: patch
        dry_run: true

    - name: Transition issue
      uses: martinsbalodis/gajira-transition@master
      with:
        issue: ${{ steps.create.outputs.issue }}
        transition: "In progress"
        newRelease: "Test ${{ steps.tag_version.outputs.new_version }}"
```
----
## Action Spec:

### Environment variables
- None

### Inputs
- `issue` (required) - issue key to perform a transition on
- `transition` - Case insensetive name of transition to apply. Example: `Cancel` or `Accept`
- `transitionId` - transition id to apply to an issue
- `newRelease` - release name that will be created and assigned to issue

### Outputs
- None

### Reads fields from config file at $HOME/jira/config.yml
- `issue`
- `transitionId`

### Writes fields to config file at $HOME/jira/config.yml
- None