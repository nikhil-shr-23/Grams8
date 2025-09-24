# Contributing to grams8

Thank you for considering contributing to grams8! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue

- **Expected vs actual behavior**
- **Environment details** (browser, operating system)
- **Screenshots** if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear title and detailed description**
- **Use case** explaining why this enhancement would be useful
- **Possible implementation** details if you have ideas

### Pull Requests

1. **Fork** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Ensure all tests pass**
6. **Update documentation** if needed
7. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/nikhil-shr-23/Grams8.git

cd grams8

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linter
pnpm lint

# Run type checking
pnpm type-check
```

## Coding Standards

- Follow **TypeScript and React best practices**
- Use **meaningful variable and function names**
- Add **type declarations** where possible
- Write **comprehensive tests** for new features
- Keep **backward compatibility** in mind

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
pnpm lint:fix
```

## Testing

All contributions must include appropriate tests:

```bash
# Run all tests
pnpm test

# Run type checking
pnpm type-check
```

### Writing Tests

- Use Jest and React Testing Library
- Test both **happy path and edge cases**
- Mock external dependencies when appropriate

## Project Structure

This project follows a standard React/Vite project structure:

- **`src/`** - Main source code
  - **`components/`** - React components
  - **`lib/`** - Utility functions and business logic
  - **`store/`** - Zustand store implementation
  - **`hooks/`** - Custom React hooks
  - **`pages/`** - Page components
- **`public/`** - Static assets
- **`docs/`** - Documentation files

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for new export format
fix: resolve relationship rendering issue
docs: update contributing guidelines
test: add tests for migration generator
refactor: improve diagram rendering performance
```

Prefix types:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `style:` Code style changes
- `chore:` Maintenance tasks

## Review Process

1. **Automated checks** must pass (tests, code style)
2. **Manual review** by maintainers
3. **Discussion** if changes are needed
4. **Approval** and merge

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: Contact maintainers directly for sensitive issues

## Recognition

Contributors will be acknowledged in:
- **README.md** contributors section
- **GitHub contributors** page

Thank you for helping make grams8 better! 🚀