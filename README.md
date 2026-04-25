# 🏋️ Fitness Tracker App

A comprehensive fitness tracking Progressive Web App (PWA) built with Next.js, TypeScript, and Tailwind CSS. Track your workouts, nutrition, body composition, and progress with intelligent features like macro prioritization and smart notifications.

## ✨ Features

### 📊 Daily Tracking
- **Workout Logging**: Track strength training with sets, reps, and weights
- **Cardio Activities**: Log runs, walks, cycling with distance, duration, and pace
- **Nutrition Tracking**: Log meals with macros (protein, carbs, fat, calories)
- **Water Intake**: Track daily hydration with quick add buttons
- **Body Composition**: Record weight, body fat %, and measurements

### 🎯 Smart Features
- **Workout/Rest Day Toggle**: Automatically adjusts calorie and macro targets
- **Macro Priority System**: Intelligent ordering of macros based on completion
- **Smart Notifications**: Context-aware reminders for water, meals, and workouts
- **Post-Workout Meal Suggestions**: Personalized meal recommendations after workouts
- **Food History**: Track frequently eaten foods for quick logging

### 📈 Progress Tracking
- **Weekly Recap**: Summary of calories, workouts, water, and macros
- **Body Trends**: Visualize weight and body fat changes over time
- **Workout History**: View past workouts with resume functionality
- **Charts & Analytics**: Track progress with visual representations

### 🔬 Advanced Calculations
- **Research-Based Calorie Burn**: MET-based calculations for strength training
- **TDEE Calculation**: Mifflin-St Jeor and Katch-McArdle formulas
- **Macro Adjustments**: Proportional scaling for workout vs rest days
- **Real-Time Estimates**: Live calorie tracking during workouts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PirATesofArabian/fitness_tracker.git
cd fitness_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Storage**: LocalStorage (browser-based)
- **PWA**: Service Worker + Manifest

## 📂 Project Structure

```
fitness_tracker/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── dashboard.tsx
│   │   ├── workout-logger.tsx
│   │   ├── nutrition.tsx
│   │   └── ...
│   └── lib/             # Utilities and types
│       ├── hooks.ts     # Custom React hooks
│       ├── types.ts     # TypeScript interfaces
│       ├── calculations.ts
│       └── utils.ts
├── public/              # Static assets
└── package.json
```

## 🎨 Key Components

### Dashboard
Main hub with 5 tabs:
- **Today**: Daily overview, quick actions, macro priority
- **Food**: Nutrition tracking and meal logging
- **Gym**: Workout logging and history
- **Trends**: Charts, weekly recap, body stats
- **More**: Profile settings and data management

### Workout Logger
- Exercise selection with categories
- Set tracking with weight and reps
- Real-time calorie estimation
- Resume incomplete workouts
- Research-based calorie calculations

### Nutrition Tracker
- Meal logging with macros
- Food search and history
- Smart food suggestions
- Macro priority visualization
- Workout/rest day adjustments

### Smart Notifications
- Water reminders (30% threshold, 4 PM)
- Meal suggestions (post-workout, evening)
- Workout reminders (rest day warnings)
- Deduplication system (1-hour cooldown)

## 💾 Data Storage

All data is stored locally in the browser's LocalStorage:
- **Workouts**: Exercise history with sets and reps
- **Meals**: Nutrition logs with macros
- **Body Composition**: Weight and measurements
- **Goals**: Personalized targets
- **User Profile**: Height, weight, body fat %

**Note**: Data persists across sessions but is device-specific. Export/import functionality available in settings.

## 🔧 Configuration

### Adjusting Goals
1. Go to "More" tab
2. Update your profile (height, weight, body fat %)
3. Set daily targets (calories, protein, carbs, fat)
4. Configure workout days per week
5. Set rest day calorie adjustment

### Customizing Notifications
Edit thresholds in `src/components/smart-notifications.tsx`:
- Water reminder time and threshold
- Meal suggestion timing
- Workout reminder conditions

## 📊 Calculations

### Calorie Burn (Strength Training)
Based on research (Ainsworth et al. 2011, Scott et al. 2011):
- MET values: 3.5-6.5 based on intensity
- Considers: weight lifted, bodyweight exercises, rest periods
- Formula: `Calories = MET × Bodyweight(kg) × Duration(hours)`

### TDEE (Total Daily Energy Expenditure)
- **Mifflin-St Jeor**: Standard BMR calculation
- **Katch-McArdle**: Uses lean body mass (more accurate)
- Activity multipliers: 1.2 (sedentary) to 1.9 (very active)

### Macro Adjustments
- Rest day: -200 calories (default)
- All macros scale proportionally with calorie changes
- Protein, carbs, fat adjust based on calorie ratio

## 🐛 Known Issues

- Icon-192.png and icon-512.png missing (404 errors)
- Quick Actions Menu needs improvement
- Service worker may need manual refresh after updates

## 🚧 Future Enhancements

- [ ] Cloud sync across devices
- [ ] Social features (share workouts)
- [ ] Exercise video demonstrations
- [ ] Barcode scanner for food logging
- [ ] Voice input for quick logging
- [ ] Apple Health / Google Fit integration
- [ ] Custom workout templates
- [ ] Progress photos
- [ ] Export data to CSV/PDF

## 📄 License

This project is open source and available under the Apache License 2.0

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.


