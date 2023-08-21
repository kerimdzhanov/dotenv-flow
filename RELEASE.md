# Release instructions

## Shipping a new version

1. Ensure you've pushed all the necessary changes to the repo and tests are successfully passed on TravisCI
2. Bump up the version in `package.json`
3. Update the `CHANGELOG.md` file using `$ yarn changelog`
4. Make a release commit with a message in format of `chore(release): vX.Y.Z`
5. Tag the release commit using `$ git tag vX.Y.X`
6. Push the release commit (including the tag) to GitHub `$ git push && git push --tags`
7. Publish the new package version using `$ yarn publish [--tag=next]`
