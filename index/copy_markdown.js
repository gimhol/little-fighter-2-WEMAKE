async function copy_markdown() {
  if (!state.actived) return;
  let ret = `# ${state.actived.title}`
  ret += '\n\n'
  ret += `[中文](CHANGELOG.MD) | [English](CHANGELOG.EN.MD)`
  ret += '\n\n'
  if (state.actived.md_desc) ret += `${state.actived.md_desc}\n\n`

  if (state.versions.length) {
    ret += '## Changelog\n\n'

    for (const version of state.versions) {
      ret += `### ${version.title}\n\n`
      if (version.date) ret += `${version.date}\n\n`
      if (version.md_desc) ret += `${version.md_desc}\n\n`
      if (version.md_changelog) ret += `${version.md_changelog}\n\n`
    }
  }
  navigator.clipboard.writeText(ret)
}
