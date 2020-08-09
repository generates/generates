// Changelog package:
// 1. Run the CLI.
// Prompt package:
// 2. Enter the semver level for each package at the prompt.
// Changelog package:
// 3. $EDITOR gets opened to add a change description in MD format
// 4. Change is saved to a .changelog/$name.json file.
// Commit package:
// 5. Files are committed with the change description as the commit message.
// Manual:
// 6. Push changes.
// Changelog package:
// 7. Action runs and detects changes to .changelog.json.
// 8. Action generates new CHANGELOG.md based on .changelog.json.
// Version package:
// 9. Action updates version number in package.json(s).
// 10. Action runs command to update any lock files.
// Commit package:
// 11. Changes are committed.
// Action:
// 12. Action creates version update PR.
// Release package:
// 13. Once version update PR is merged, Action releases packages based on
//     `isReleased` boolean in .changelog.json.
// Release Action:
// 14. Action publishes package.

// Add change action:
// 1. Runs on new label.
// 2. Adds to changelog via changelog package.
// 3. Commits changes via commit package.
// 4. Pushes changes to PR via GitHub API.
