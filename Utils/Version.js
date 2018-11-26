const pck = require('./../package.json')
const semver = require('semver')

const versionRequirements = [
  {
    name: 'Node',
    currentVersion: semver.clean(process.version),
    versionRequirement: pck.engines.node
  }
]

for (let versionRequirement of versionRequirements) {
  if (!semver.satisfies(versionRequirement.currentVersion, versionRequirement.versionRequirement)) {
    console.warn(`${versionRequirement.name} Version Should ${versionRequirement.versionRequirement} Now : ${versionRequirement.currentVersion}`)
  }
}
