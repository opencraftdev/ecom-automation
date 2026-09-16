export const meta = {
  name: 'build',
  description: 'Plan → parallel workers → logic+review audit → plain-words summary',
  whenToUse: 'A coding task big enough to split across parallel workers with independent verification',
  phases: [
    { title: 'Plan', detail: 'graph-engineer splits task into disjoint units' },
    { title: 'Build', detail: 'one worker per unit, in parallel' },
    { title: 'Audit', detail: 'logic + review auditors per unit, one repair pass' },
    { title: 'Synthesize', detail: 'plain-words summary' },
  ],
}

const task = typeof args === 'string' ? args : (args && args.task)
if (!task) throw new Error('Pass the task: Workflow({name:"build", args:"<task>"})')

const PLAN = { type: 'object', required: ['units'], properties: { units: { type: 'array', items: {
  type: 'object', required: ['id', 'goal', 'files', 'acceptance'],
  properties: { id: { type: 'string' }, goal: { type: 'string' }, files: { type: 'array', items: { type: 'string' } }, acceptance: { type: 'string' } } } } } }
const REPORT = { type: 'object', required: ['files', 'changes', 'check', 'risks'], properties: {
  files: { type: 'array', items: { type: 'string' } }, changes: { type: 'array', items: { type: 'string' } },
  check: { type: 'string' }, risks: { type: 'array', items: { type: 'string' } } } }
const VERDICT = { type: 'object', required: ['pass', 'issues'], properties: { pass: { type: 'boolean' },
  issues: { type: 'array', items: { type: 'object', required: ['where', 'what', 'severity'],
    properties: { where: { type: 'string' }, what: { type: 'string' }, severity: { type: 'string' }, fix: { type: 'string' } } } } } }

phase('Plan')
const plan = await agent(`Task: ${task}\nSplit into disjoint work units.`, { agentType: 'graph-engineer', schema: PLAN, effort: 'low' })
const units = (plan && plan.units || []).slice(0, 6)
if (!units.length) throw new Error('graph-engineer returned no units')
log(`${units.length} unit(s): ${units.map(u => u.id).join(', ')}`)

const unitText = u => `Unit ${u.id}\nGoal: ${u.goal}\nFiles (only these): ${u.files.join(', ')}\nAcceptance: ${u.acceptance}`
const audit = (u, report) => parallel(['logic', 'review'].map(lens => () =>
  agent(`lens=${lens}\n${unitText(u)}\nWorker report: ${JSON.stringify(report)}`,
    { agentType: 'auditor', schema: VERDICT, label: `audit:${lens}:${u.id}`, phase: 'Audit' })))
const failed = verdicts => verdicts.filter(Boolean).filter(v => !v.pass)

// ponytail: no worktree isolation — units own disjoint files by construction. Add isolation:'worktree' if graph-engineer overlap ever bites.
const results = await pipeline(units,
  u => agent(`${unitText(u)}\nOverall task for context: ${task}`,
    { agentType: 'worker', schema: REPORT, label: `worker:${u.id}`, phase: 'Build' }),
  async (report, u) => {
    if (!report) return { unit: u, report: null, verdicts: [], repaired: false }
    let verdicts = await audit(u, report)
    let repaired = false
    if (failed(verdicts).length) {                      // one repair pass, then re-audit
      const issues = failed(verdicts).flatMap(v => v.issues)
      log(`${u.id}: ${issues.length} audit issue(s) → repair`)
      const fixed = await agent(`${unitText(u)}\nFix these audit issues, nothing else:\n${JSON.stringify(issues)}`,
        { agentType: 'worker', schema: REPORT, label: `repair:${u.id}`, phase: 'Audit' })
      if (fixed) { report = fixed; verdicts = await audit(u, fixed); repaired = true }
    }
    return { unit: u, report, verdicts, repaired }
  })

phase('Synthesize')
const summary = await agent(`Task: ${task}\nResults: ${JSON.stringify(results.filter(Boolean))}`,
  { agentType: 'synthesizer', effort: 'low' })
return { summary, results }
