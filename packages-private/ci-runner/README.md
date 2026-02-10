# @dooksa/ci-runner

A development server and live bundling tool for Dooksa applications. This package provides a complete development environment with hot-reloading capabilities for both client and server-side code.

## Overview

The `@dooksa/ci-runner` is a private development tool designed for the Dooksa ecosystem. It creates a local development server that automatically rebuilds and reloads your application as you make changes, providing a seamless development experience.

## Configuration

The ci-runner is configured through the source files:

### Server Configuration
- **Database**: Stores snapshots in `./app/.ds_snapshots`
- **Assets**: Serves from `./app/assets` at `/assets` path
- **Port**: Configurable via server options

### Build Configuration
- **Entry Points**: `src/app-client.js` and `app/assets/styles.css`
- **Output**: Bundled to `./app` directory
- **Format**: ES modules
- **Watch Mode**: Enabled for development

## License

AGPL-3.0-or-later
