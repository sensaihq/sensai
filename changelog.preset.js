const conventionalChangelogConventionalCommits = require("conventional-changelog-conventionalcommits");

module.exports = async function customPreset() {
  const base = await conventionalChangelogConventionalCommits();

  return {
    ...base,
    whatBump(commits) {
      let level = 2; // patch by default
      let hasMajor = false;
      let hasMinor = false;
      let hasPatch = false;

      commits.forEach((commit) => {
        if (commit.type === "chore") return; // Ignore chore commits

        if (commit.notes.length > 0) hasMajor = true;
        else if (commit.type === "feat") hasMinor = true;
        else if (commit.type === "fix") hasPatch = true;
      });

      if (hasMajor) return { level: 0, reason: "BREAKING CHANGE found." };
      if (hasMinor) return { level: 1, reason: "Feature added." };
      if (hasPatch) return { level: 2, reason: "Fix applied." };

      return null; // No version bump
    },
  };
};
