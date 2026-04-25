export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
    deprecated?: string[];
    security?: string[];
  };
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2024-04-25',
    changes: {
      added: [
        'OCR body scan extraction from images',
        'Intelligent InBody scan parsing',
        'Automatic extraction of weight, body fat %, muscle mass, BMR',
        'Support for multiple body scan formats',
        'Error handling and validation for scan data',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2024-04-25',
    changes: {
      added: [
        'Smart goal-based fitness system with AI recommendations',
        'Three fitness goals: Visible Abs (fat loss), Muscle Gain (bulking), Athletic (maintenance)',
        'Scientifically-backed calorie calculations using Mifflin-St Jeor and Katch-McArdle formulas',
        'Goal-specific macro targets with personalized training and nutrition tips',
        'Activity level selection from sedentary to very active',
        'Height, age, and gender tracking in body composition',
        'Edit buttons for quick access to modify entries',
        'In-app changelog system with auto-show on updates',
      ],
      changed: [
        'Profile Settings redesigned - weight from daily log, body metrics from composition scan',
        'Body composition form now includes height, age, and gender fields',
        '"Recalc from Profile" button now uses smart goal-based calculations',
        'Duplicate entries for same date are now replaced instead of creating multiples',
      ],
      fixed: [
        'Daily Overview spacing - calories and water values now properly visible',
        'Text overlap issues in dashboard cards',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2024-04-25',
    changes: {
      added: [
        'Initial release of Fitness Tracker',
        'Workout logging with calisthenics focus (pull-ups, dips, pistol squats)',
        'Nutrition tracking with detailed macro breakdown',
        'Cardio activity logging with pace and distance tracking',
        'Body composition tracking with measurements',
        'Smart notifications system for workout reminders',
        'Weekly recap feature with progress insights',
        'PWA support for iPhone installation',
        'Dark mode support',
      ],
    },
  },
];

export function getLatestVersion(): string {
  return CHANGELOG[0]?.version || '1.0.0';
}

export function getChangelogForVersion(version: string): ChangelogEntry | undefined {
  return CHANGELOG.find(entry => entry.version === version);
}

export function hasSeenVersion(version: string): boolean {
  if (typeof window === 'undefined') return true;
  const lastSeen = localStorage.getItem('last_seen_version');
  return lastSeen === version;
}

export function markVersionAsSeen(version: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('last_seen_version', version);
}

export function shouldShowChangelog(): boolean {
  const latestVersion = getLatestVersion();
  return !hasSeenVersion(latestVersion);
}

