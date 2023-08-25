# Release instructions

## Shipping a new version

1. Make sure all the latest changes are pushed to the repo and all the related
   workflow tests are passing on CI (https://github.com/kerimdzhanov/dotenv-flow/actions)
2. Bump up the version in `package.json`
3. Update the `CHANGELOG.md` file using `$ yarn changelog`
4. Make a release commit with a message in format of `chore(release): vX.Y.Z`
5. Tag the release commit using `$ git tag vX.Y.X`
6. Push the release commit (with the tag) to GitHub `$ git push && git push --tags`
7. Create a new version release on GitHub based on the created tag

> Once the release is published, Github Actions' workflow will build and publish the new package version to NPM.
