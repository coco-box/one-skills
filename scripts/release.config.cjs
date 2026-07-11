const process = require('node:process')

const releaseConfig = {
  registry: process.env.ONE_SKILLS_NPM_REGISTRY || 'https://registry.npmjs.org/',
  access: 'public',
  distTag: process.env.ONE_SKILLS_NPM_TAG || 'latest',
  branch: process.env.ONE_SKILLS_RELEASE_BRANCH || 'main',
  tagPrefix: 'v',
  createGitHubRelease: true,
}

module.exports = {
  releaseConfig,
}
