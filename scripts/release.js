import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import ansis from 'ansis'
import prompts from 'prompts'

const envPath = new URL('../.env', import.meta.url)
if (existsSync(envPath)) process.loadEnvFile(envPath)

const require = createRequire(import.meta.url)
const { releaseConfig } = require('./release.config.cjs')

const STEPS = {
  CHECK: '环境与发布前检查',
  VERSION: '版本更新',
  CHANGELOG: '生成 CHANGELOG',
  PUBLISH: '发布到 npm',
  GIT_RELEASE: '提交、标签、推送与 GitHub Release',
}

const packagePath = new URL('../package.json', import.meta.url)
const changelogPath = new URL('../CHANGELOG.md', import.meta.url)

function run(command, args, options = {}) {
  const output = execFileSync(command, args, {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  })
  return options.trim === false ? output : output?.trim()
}

function withNpmAuth(callback) {
  if (!releaseConfig.npmToken) return callback(process.env)

  const directory = mkdtempSync(path.join(tmpdir(), 'one-skills-npm-'))
  const userConfig = path.join(directory, '.npmrc')
  const registryHost = new URL(releaseConfig.registry).host
  writeFileSync(userConfig, `registry=${releaseConfig.registry}\n//${registryHost}/:_authToken=${releaseConfig.npmToken}\n`)
  try {
    return callback({ ...process.env, NPM_CONFIG_USERCONFIG: userConfig })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function readPackage() {
  return JSON.parse(readFileSync(packagePath, 'utf8'))
}

function writePackage(packageInfo) {
  writeFileSync(packagePath, `${JSON.stringify(packageInfo, null, 2)}\n`)
}

function cancel() {
  console.log(ansis.yellowBright('已取消发布'))
  process.exit(0)
}

async function askSteps(packageName) {
  const { selectedSteps } = await prompts({
    type: 'multiselect',
    name: 'selectedSteps',
    message: `[${ansis.cyan(packageName)}] 请选择执行步骤（默认全选）`,
    choices: Object.values(STEPS).map((step) => ({ title: step, value: step, selected: true })),
    instructions: false,
    hint: '空格切换，回车确认',
  }, { onCancel: cancel })
  return new Set(selectedSteps || [])
}

function bumpVersion(current, type) {
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/)
  if (!match) throw new Error(`当前版本不是可识别的 SemVer：${current}`)
  let [, major, minor, patch] = match.map((value, index) => index === 0 ? value : Number(value))
  if (type === 'major') return `${major + 1}.0.0`
  if (type === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

async function updateVersion(packageInfo) {
  const { releaseType } = await prompts({
    type: 'select',
    name: 'releaseType',
    message: `当前版本 ${ansis.yellow(packageInfo.version)}，请选择新版本`,
    choices: [
      { title: `patch → ${bumpVersion(packageInfo.version, 'patch')}`, value: 'patch' },
      { title: `minor → ${bumpVersion(packageInfo.version, 'minor')}`, value: 'minor' },
      { title: `major → ${bumpVersion(packageInfo.version, 'major')}`, value: 'major' },
      { title: '自定义版本', value: 'custom' },
    ],
  }, { onCancel: cancel })

  let newVersion = releaseType === 'custom'
    ? (await prompts({
        type: 'text',
        name: 'version',
        message: '请输入 SemVer 版本号',
        validate: (value) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value) || '版本格式无效',
      }, { onCancel: cancel })).version
    : bumpVersion(packageInfo.version, releaseType)

  packageInfo.version = newVersion
  writePackage(packageInfo)
  console.log(ansis.green(`版本已更新：${newVersion}`))
  return newVersion
}

function latestTag() {
  try {
    return run('git', ['describe', '--tags', '--abbrev=0'], { capture: true })
  } catch {
    return null
  }
}

function generateChangelog(version) {
  const previousTag = latestTag()
  const range = previousTag ? `${previousTag}..HEAD` : 'HEAD'
  let commits = ''
  try {
    commits = run('git', ['log', range, '--pretty=format:- %s (%h)'], { capture: true })
  } catch {
    commits = ''
  }
  const section = `## ${version} - ${new Date().toISOString().slice(0, 10)}\n\n${commits || '- 首次发布'}\n\n`
  const oldContent = existsSync(changelogPath) ? readFileSync(changelogPath, 'utf8') : '# 更新日志\n\n'
  const header = oldContent.startsWith('# 更新日志') ? '# 更新日志\n\n' : ''
  const body = header ? oldContent.slice(header.length) : oldContent
  writeFileSync(changelogPath, `${header}${section}${body}`)
  console.log(ansis.green(`CHANGELOG 已生成（基于 ${previousTag || '全部提交'}）`))
  return commits || '- 首次发布'
}

function ensureCleanRepository() {
  const status = run('git', ['status', '--porcelain'], { capture: true })
  if (status) throw new Error('工作区存在未提交改动，请先提交或暂存后再发布')
}

function changedFiles() {
  const output = run('git', ['status', '--porcelain=v1', '-z'], { capture: true, trim: false })
  if (!output) return []
  const entries = output.split('\0').filter(Boolean)
  const files = []
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const status = entry.slice(0, 2)
    files.push(entry.slice(3))
    if (status.includes('R') || status.includes('C')) index += 1
  }
  return files
}

function preflight(packageInfo) {
  console.log(ansis.cyan('\n开始发布前检查'))
  ensureCleanRepository()
  const branch = run('git', ['branch', '--show-current'], { capture: true })
  if (branch !== releaseConfig.branch) throw new Error(`请在 ${releaseConfig.branch} 分支发布，当前为 ${branch || 'detached HEAD'}`)
  run('git', ['remote', 'get-url', 'origin'], { capture: true })
  withNpmAuth((env) => run('npm', ['whoami', '--registry', releaseConfig.registry], { capture: true, env }))
  run('pnpm', ['check'])
  run('pnpm', ['test'])
  run('pnpm', ['pack'])
  console.log(ansis.green(`${packageInfo.name} 发布前检查通过`))
}

function publishToNpm(packageInfo) {
  console.log(ansis.cyan(`\n发布 ${packageInfo.name}@${packageInfo.version} 到 ${releaseConfig.registry}`))
  withNpmAuth((env) => run('pnpm', [
      'publish',
      '--registry', releaseConfig.registry,
      '--access', releaseConfig.access,
      '--tag', releaseConfig.distTag,
      '--no-git-checks',
    ], { env }))
  console.log(ansis.green('npm 发布完成'))
}

async function createGitRelease(packageInfo, changelog) {
  const tag = `${releaseConfig.tagPrefix}${packageInfo.version}`
  const allowed = new Set(['package.json', 'pnpm-lock.yaml', 'CHANGELOG.md'])
  const changed = changedFiles()
  const unexpected = changed.filter((file) => !allowed.has(file))
  if (unexpected.length) throw new Error(`发现发布流程之外的改动：${unexpected.join(', ')}`)
  if (changed.length === 0) throw new Error('没有可提交的版本或 CHANGELOG 改动，请选择版本更新或变更日志步骤')

  console.log(`\n即将提交以下发布文件：\n${changed.map((file) => `  - ${file}`).join('\n')}`)
  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: `确认创建提交和标签 ${tag} 并推送？`,
    initial: true,
  }, { onCancel: cancel })
  if (!confirmed) {
    console.log(ansis.yellowBright('已跳过 Git 提交、标签和推送'))
    return
  }

  run('git', ['add', ...changed])
  run('git', ['commit', '-m', `chore: release ${packageInfo.name}@${packageInfo.version}`])
  run('git', ['tag', '-a', tag, '-m', `${packageInfo.name}@${packageInfo.version}`])
  run('git', ['push', 'origin', releaseConfig.branch, '--follow-tags'])

  if (releaseConfig.createGitHubRelease) {
    try {
      run('gh', ['release', 'create', tag, '--title', `${packageInfo.name}@${packageInfo.version}`, '--notes', changelog])
    } catch {
      console.log(ansis.yellow(`GitHub Release 创建失败或 gh 未登录；Git 标签 ${tag} 已推送，可稍后手动创建`))
    }
  }
  console.log(ansis.green(`Git 发布完成：${tag}`))
}

async function confirmRelease(packageInfo, steps) {
  console.log(`\n包：${ansis.cyan(packageInfo.name)}`)
  console.log(`版本：${ansis.yellow(packageInfo.version)}`)
  console.log(`Registry：${releaseConfig.registry}`)
  console.log(`步骤：${[...steps].join(' → ') || '无'}`)
  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: '确认继续？',
    initial: true,
  }, { onCancel: cancel })
  return confirmed
}

async function main() {
  let packageInfo = readPackage()
  const steps = await askSteps(packageInfo.name)
  if (steps.size === 0) {
    console.log(ansis.yellowBright('未选择任何发布步骤，已退出'))
    return
  }

  if (!await confirmRelease(packageInfo, steps)) {
    console.log(ansis.yellowBright('已取消发布'))
    return
  }
  if (steps.has(STEPS.CHECK)) preflight(packageInfo)
  if (steps.has(STEPS.VERSION)) {
    await updateVersion(packageInfo)
    packageInfo = readPackage()
  }

  let changelog = `发布 ${packageInfo.name}@${packageInfo.version}`
  if (steps.has(STEPS.CHANGELOG)) changelog = generateChangelog(packageInfo.version)

  if (steps.has(STEPS.PUBLISH)) {
    const { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: ansis.redBright(`即将向 npm 发布 ${packageInfo.name}@${packageInfo.version}，确认发布？`),
      initial: true,
    }, { onCancel: cancel })
    if (!confirmed) {
      console.log(ansis.yellowBright('已取消 npm 发布，后续步骤未执行'))
      return
    }
    publishToNpm(packageInfo)
  }

  if (steps.has(STEPS.GIT_RELEASE)) await createGitRelease(packageInfo, changelog)
  console.log(ansis.greenBright(`\n完成：${packageInfo.name}@${packageInfo.version}`))
}

main().catch((error) => {
  console.error(ansis.redBright(`\n发布失败：${error.message}`))
  process.exit(1)
})
