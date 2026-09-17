# Releases

A merged pull request targeting `main` starts the release workflow. Closed,
unmerged PRs and direct pushes do not create releases.

1. In a release PR, run `npm version patch --no-git-tag-version` (or `minor`).
2. Commit both `package.json` and `package-lock.json`, and update the changelog.
3. Merge the PR into `main`.

The workflow uses that exact merge commit. A version tagged on an earlier commit
is skipped. A new version runs the Node 22/24 suite and Chromium checks, creates
`v<version>` with generated GitHub release notes, then explicitly calls npm publishing.
Stable versions only are supported by automatic releases. Major releases are
disabled: versions must stay on `0.x.x`, and new versions must move forward by
minor or patch. There is no automatic promotion to `1.0.0`. Manual releases also
undergo the zero-major and package/lockfile checks before npm publishing.

No dependencies are added. GitHub release creation uses the repository's built-in
`GITHUB_TOKEN`; npm publishing uses the existing `NPM_TOKEN` repository secret.
Repository rules must permit the workflow to create release tags. No personal
GitHub token is needed.

The explicit reusable-workflow call is required because releases created with
`GITHUB_TOKEN` do not trigger release-event workflows. Manually published stable
GitHub releases still run npm publishing, with tag/version validation.

If npm publishing fails after GitHub release creation, correct the problem and
re-run the workflow. Existing releases are retained and versions already present
on npm are skipped. Registry errors other than a missing version fail the run.

The current package version is already tagged; merging without a version bump
will intentionally skip a new release. Configure branch protection to require CI
before merging. This workflow does not change repository settings or secrets.
