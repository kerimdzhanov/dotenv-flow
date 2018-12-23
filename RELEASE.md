# Release instructions

## Shipping a new version

1. Ensure you've pushed all the necessary changes to the repo and tests are successfully passed on TravisCI
2. Bump up the version in `package.json`
3. Update the `package-lock.json` file using `$ npm install --package-lock-only`
4. Update the `CHANGELOG.md` file using `$ yarn changelog`
5. Make a release commit with a message in format `chore(release): vX.Y.Z`
6. Tag the release commit using `$ git tag vX.Y.X`
7. Push the release commit (including the tag) to github `$ git push && git push --tags`
8. Publish the new package version using `$ npm publish`
