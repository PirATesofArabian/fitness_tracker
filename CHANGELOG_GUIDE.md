# Changelog System Guide

This guide explains how to maintain and use the changelog system in the Fitness Tracker app.

## Overview

The changelog system consists of three parts:
1. **CHANGELOG.md** - Human-readable markdown file (for GitHub/documentation)
2. **src/lib/changelog.ts** - Structured changelog data (for in-app display)
3. **src/components/changelog-dialog.tsx** - UI component to display changelogs

## How to Add a New Release

### Step 1: Update CHANGELOG.md

Edit `CHANGELOG.md` and move items from `[Unreleased]` to a new version section:

```markdown
## [1.2.0] - 2024-02-01

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```

### Step 2: Update src/lib/changelog.ts

Add a new entry to the `CHANGELOG` array at the **top** (newest first):

```typescript
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2024-02-01',
    changes: {
      added: [
        'New feature description',
        'Another new feature',
      ],
      changed: [
        'Modified feature description',
      ],
      fixed: [
        'Bug fix description',
      ],
    },
  },
  // ... previous versions
];
```

### Step 3: Update package.json Version

```bash
npm version patch  # for bug fixes (1.1.0 -> 1.1.1)
npm version minor  # for new features (1.1.0 -> 1.2.0)
npm version major  # for breaking changes (1.1.0 -> 2.0.0)
```

## Changelog Categories

Use these categories to organize changes:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Features that will be removed in future versions
- **Removed** - Features that have been removed
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

## In-App Changelog Features

### Auto-Show on Update
- Automatically shows changelog dialog on first app launch after update
- Uses localStorage to track last seen version
- Only shows once per version

### Manual Access
Users can view changelog anytime by:
1. Going to Profile/Settings
2. Clicking "What's New" or changelog icon
3. Viewing all previous versions

### "New" Badge
- Shows a sparkle badge when new version is available
- Disappears after user views the changelog
- Reappears on next version update

## Integration Example

### Add to Dashboard/Profile

```typescript
import { ChangelogDialog, ChangelogBadge } from '@/components/changelog-dialog';

function YourComponent() {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowChangelog(true)}
        className="relative"
      >
        What's New
        <ChangelogBadge />
      </button>

      <ChangelogDialog 
        open={showChangelog} 
        onOpenChange={setShowChangelog} 
      />
    </>
  );
}
```

### Auto-Show on App Load

```typescript
import { ChangelogDialog } from '@/components/changelog-dialog';

function App() {
  return (
    <>
      {/* Auto-shows if new version */}
      <ChangelogDialog />
      
      {/* Your app content */}
    </>
  );
}
```

## Best Practices

### Writing Changelog Entries

✅ **Good:**
- "Added smart goal-based fitness system with AI recommendations"
- "Fixed Daily Overview spacing issue with overlapping text"
- "Changed Profile Settings to show read-only computed fields"

❌ **Bad:**
- "Updated stuff"
- "Fixed bug"
- "Made changes to profile"

### Version Numbering (Semantic Versioning)

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes, major redesigns
- **MINOR** (1.0.0 -> 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes, small improvements

### Release Frequency

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Every 2-4 weeks for new features
- **Major releases**: Every 3-6 months for major updates

## Workflow Example

### Before Release

1. Collect all changes in `[Unreleased]` section of CHANGELOG.md
2. Test all features thoroughly
3. Update version number in package.json
4. Move unreleased changes to new version section
5. Update src/lib/changelog.ts with same information
6. Commit changes
7. Create git tag: `git tag v1.2.0`
8. Push with tags: `git push --tags`

### After Release

1. Deploy to production
2. Users will automatically see "What's New" dialog
3. Monitor for issues
4. Start new `[Unreleased]` section for next version

## Maintenance

### Keep It Updated
- Add entries as you develop features
- Don't wait until release to write changelog
- Be specific and user-focused

### Review Regularly
- Check changelog before each release
- Ensure all significant changes are documented
- Remove or consolidate minor internal changes

### User-Friendly Language
- Write for users, not developers
- Focus on benefits and impacts
- Avoid technical jargon when possible

## Example Release Process

```bash
# 1. Update changelog files
vim CHANGELOG.md
vim src/lib/changelog.ts

# 2. Bump version
npm version minor

# 3. Commit
git add .
git commit -m "chore: Release v1.2.0"

# 4. Tag
git tag v1.2.0

# 5. Push
git push origin feature/smart-goal-system
git push --tags

# 6. Create PR and merge
# 7. Deploy to production
```

## Troubleshooting

### Changelog Not Showing
- Check localStorage: `localStorage.getItem('last_seen_version')`
- Clear it to test: `localStorage.removeItem('last_seen_version')`
- Verify version in src/lib/changelog.ts matches package.json

### Badge Not Appearing
- Ensure ChangelogBadge component is imported
- Check if shouldShowChangelog() returns true
- Verify component is rendered in correct location

### Version Mismatch
- Always update both CHANGELOG.md and src/lib/changelog.ts
- Keep package.json version in sync
- Use semantic versioning consistently

## Resources

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)