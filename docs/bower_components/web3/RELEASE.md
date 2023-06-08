# web3.js Release Guidelines

## Version Number Definition

The web3.js project follows the [semver 2.0.0 specification](https://semver.org/).

### Major

The `major` version has to be increased as soon as a breaking change is introduced. The definition of a breaking change is anything that requires a depending project to update their code base, build pipeline or tests.

### Minor

The `minor` is increased as soon as new smaller features do get introduced. A `minor` release will not affect any depending project. Such a release only introduces smaller enhancements and features a project could use.

### Patch

A patch release only contains required bug fixes with a low risk to impact depending project.

Further details about versioning can be found in the [semver 2.0.0 specification](https://semver.org/) we follow.

## Release Process

### Running E2E Tests

`E2E Network Tests` will be triggered to run via a Github workflow when a PR is open for a branch prefixed with `release/` and is being merged into `4.x` branch. These tests depend on a couple of ENVs to be set that are configurable in Github's Action Secrets when running these tests in CI. The following required secrets are:

-   `E2E_TESTS_ALLOWED_SEND_TRANSACTION`: If set to `false` this will keep the Sepolia tests that spend ETH from runnning, setting to anything else will cause them to run
-   `TEST_ACCOUNT_PRIVATE_KEY`: The private key of the Sepolia account to use when submitting transactions
-   `INFURA_SEPOLIA_HTTP`: The provider to be used to access the Sepolia network
-   `INFURA_MAINNET_HTTP`: The provider to be used to access Mainnet

---

1. `git checkout 4.x`: Verify you are on the `4.x` base branch
2. `git checkout -b release/bumped-version`: Create and checkout a branch with the `bumped-version` e.g. `git checkout -b release/4.0.0-alpha.0`
    - `bumped-version` of release branch should be of main web3 package.
3. `yarn`: Verify all dependencies have been installed
4. Bump packages version numbers using `lerna version --no-push --no-private --no-git-tag-version` . This will update package versions and also run lifecycle scripts.
    - It will prompt for new version , modify package metadata and run life cycle scripts (in our case `version`), for bootstrapping lerna will use underlying yarn.
5. Update the root and each package's `CHANGELOG.md`: Replace the `## [Unreleased]` header with new package version, and move `## [Unreleased]` header below listed changes
    - For root `CHANGELOG.md` copy over all the listed changes for each package
6. Run `yarn build:web` after lerna updates version and builds lib . This will bundle minified builds.
7. Commit the version bump changes and builds in release branch created in step 2
8. `git tag bumped-version`: Tag the commit with bumped version having prefix `v` , e.g. `git tag v4.0.1-alpha.0`
9. `git push origin release/bumped-version`: Push release branch to `origin`
10. `git push origin --tags`: Push release tag created in `Step 8` to `origin`
11. Create a draft release on Github similar to [this](https://github.com/ChainSafe/web3.js/releases/tag/web3-providers-base%401.0.0-alpha.1)
    - Check `This is a pre-release`
    - In the release description, copy all entries in `CHANGELOG.md` for the version being released
12. Click `Save draft`
13. Open pull request to merge branch created in `Step 2` (`release/bumped-version`) into `4.x`
14. Wait for all tests to pass in github CI/CD , If there are any unusual warnings or errors in logs, discuss with team
15. When sufficient approvals have been met, merge the pull request
16. Publish documentation changes
17. Publish draft release created in `Step 11`
18. Run `npx lerna publish from-package --ignore-scripts --dist-tag alpha` in the root directory to publish packages to NPM
    - lerna will not invoke life cycle scripts before publishing and this will publish all packages to NPM public registry
