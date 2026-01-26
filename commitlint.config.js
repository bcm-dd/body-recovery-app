/* eslint-env node */
/**
 * Commitlint configuration for conventional commits
 * @see https://www.conventionalcommits.org/
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these values
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD configuration changes
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Revert a previous commit
        'wip',      // Work in progress (not recommended for final commits)
      ],
    ],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Scope must be lowercase
    'scope-case': [2, 'always', 'lower-case'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject should not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject should be in sentence case (but we allow lowercase)
    'subject-case': [0],
    // Header should not exceed 100 characters
    'header-max-length': [2, 'always', 100],
    // Body lines should not exceed 200 characters
    'body-max-line-length': [1, 'always', 200],
    // Footer lines should not exceed 200 characters
    'footer-max-line-length': [1, 'always', 200],
  },
  // Custom prompt configuration for interactive commits
  prompt: {
    questions: {
      type: {
        description: 'Select the type of change you are committing',
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '',
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
            emoji: '',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '',
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
            emoji: '',
          },
          ci: {
            description: 'Changes to CI configuration files and scripts',
            title: 'Continuous Integration',
            emoji: '',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g., web, mobile, ui, data)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change (optional)',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description: 'A breaking change requires a body. Please describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description: 'Add issue references (e.g., "fix #123", "re #123")',
      },
    },
  },
};
