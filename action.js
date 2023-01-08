const _ = require('lodash')
const Jira = require('./common/net/Jira')

module.exports = class {
  constructor ({ githubEvent, argv, config }) {
    this.Jira = new Jira({
      baseUrl: config.baseUrl,
      token: config.token,
      email: config.email,
    })

    this.config = config
    this.argv = argv
    this.githubEvent = githubEvent
  }

  async execute () {
    const { argv } = this

    const issueId = argv.issue
		const newReleaseId = argv.newRelease;
    const { transitions } = await this.Jira.getIssueTransitions(issueId)

    const transitionToApply = _.find(transitions, (t) => {
      if (t.id === argv.transitionId) return true
      if (t.name.toLowerCase() === argv.transition.toLowerCase()) return true
    })

    if (!transitionToApply) {
      console.log('Please specify transition name or transition id.')
      console.log('Possible transitions:')
      transitions.forEach((t) => {
        console.log(`{ id: ${t.id}, name: ${t.name} } transitions issue to '${t.to.name}' status.`)
      })

      return
    }

		const issue = await this.Jira.getIssue(issueId)
		const projectId = issue.fields.project.id;

		let newVersion = await this.Jira.getVersion(projectId, newReleaseId);

		if(newVersion !== undefined) {
			console.log(`Release added to issue: ${newReleaseId}`);
		} else {
			// hardcoded release date for next Tuesday
			let nextTuesday = new Date();
			nextTuesday.setDate(nextTuesday.getDate() + (2 + 7 - nextTuesday.getDay()) % 7);

			newVersion = await this.Jira.createVersion({
				projectId: projectId,
				name: newReleaseId,
				startDate: new Date().toISOString().substring(0, 10),
				releaseDate: nextTuesday.toISOString().substring(0, 10),
			});

			console.log(`Created new release and added to issue: ${newReleaseId}`)
		}

		await this.Jira.updateIssueFixVersion(issueId, newVersion);

    console.log(`Selected transition:${JSON.stringify(transitionToApply, null, 4)}`)

    await this.Jira.transitionIssue(issueId, {
      transition: {
        id: transitionToApply.id,
      },
    })

    const transitionedIssue = await this.Jira.getIssue(issueId)

    // console.log(`transitionedIssue:${JSON.stringify(transitionedIssue, null, 4)}`)
    console.log(`Changed ${issueId} status to : ${_.get(transitionedIssue, 'fields.status.name')} .`)
    console.log(`Link to issue: ${this.config.baseUrl}/browse/${issueId}`)

    return {}
  }
}
