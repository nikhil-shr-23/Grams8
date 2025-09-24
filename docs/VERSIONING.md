# How to Bump the Application Version

This document explains the process for updating the version number of the grams8 application.

## Version Source

The application's version number is the single source of truth and is managed in the `version` field of the `package.json` file at the root of the project.

```json
{
  "name": "grams8",
  "private": true,
  "version": "1.0.0",
  "type": "module"
}
```

During the build process, this version number is automatically injected into the application and becomes visible in the "Check for Updates" dialog.

## Bumping the Version

We follow [Semantic Versioning](https://semver.org/) (SemVer) principles. The version format is `MAJOR.MINOR.PATCH`.

-   **MAJOR** version when you make incompatible API changes.
-   **MINOR** version when you add functionality in a backward-compatible manner.
-   **PATCH** version when you make backward-compatible bug fixes.

### Recommended Method: Using npm

The recommended way to update the version is by using the `npm version` command. This command automatically updates the `package.json` file, creates a new git commit, and adds a git tag for the new version.

-   **To bump the PATCH version (e.g., 1.0.0 -> 1.0.1):**
    ```bash
    npm version patch
    ```

-   **To bump the MINOR version (e.g., 1.0.1 -> 1.1.0):**
    ```bash
    npm version minor
    ```

-   **To bump the MAJOR version (e.g., 1.1.0 -> 2.0.0):**
    ```bash
    npm version major
    ```

After running the command, remember to push the new commit and tags to the repository:

```bash
git push && git push --tags
```

### Manual Method

While not recommended for consistency, you can also bump the version by manually editing the `version` field in the `package.json` file. If you do this, you should also create a corresponding git commit and tag yourself.

## How It Works

The `vite.config.ts` file reads the version from `package.json` during the build process and makes it available globally within the application code as `__APP_VERSION__`. No further action is needed after updating the version number; the next build will automatically include the new version.