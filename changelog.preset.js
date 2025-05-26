const conventionalChangelogConventionalCommits = require("conventional-changelog-conventionalcommits");

module.exports = {
  ...conventionalChangelogConventionalCommits,
  whatBump(commits) {
    let level = 2; // patch by default
    let hasMajor = false;
    let hasMinor = false;
    let hasPatch = false;

    commits.forEach((commit) => {
      if (commit.type === "chore") return; // 👈 ignore
      if (commit.type === "feat") hasMinor = true;
      if (commit.type === "fix") hasPatch = true;
      if (commit.notes.length > 0) hasMajor = true;
    });

    if (hasMajor) return { level: 0 };
    if (hasMinor) return { level: 1 };
    if (hasPatch) return { level: 2 };
    return null;
  },
};
