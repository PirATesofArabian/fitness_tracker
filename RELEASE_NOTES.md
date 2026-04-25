# Release Notes

## v1.0.0 - Initial Release (April 25, 2026)

🎉 **First stable release of Fitness Tracker!**

### ✨ Features

#### Core Tracking
- **Workout Logging** - Track strength training with sets, reps, and weights
- **Cardio Activities** - Log runs, walks, cycling with distance and pace
- **Nutrition Tracking** - Log meals with complete macro breakdown
- **Water Intake** - Track daily hydration with quick add buttons
- **Body Composition** - Record weight, body fat %, and measurements

#### Smart Features
- **Workout/Rest Day Toggle** - Automatically adjusts calorie and macro targets
- **Macro Priority System** - Intelligent ordering based on completion status
- **Smart Notifications** - Context-aware reminders for water, meals, and workouts
- **Post-Workout Meals** - Personalized meal suggestions after training
- **Food History** - Quick access to frequently eaten foods

#### Analytics
- **Weekly Recap** - Summary of calories, workouts, water, and macros
- **Body Trends** - Visualize weight and body fat changes
- **Workout History** - View and resume past workouts
- **Progress Charts** - Track your fitness journey

### 🔬 Technical Highlights
- Research-based calorie calculations (MET values)
- TDEE calculation using Mifflin-St Jeor and Katch-McArdle formulas
- Proportional macro adjustments for rest days
- Real-time workout calorie estimation
- LocalStorage for offline data persistence

### 📱 Deployment
- Progressive Web App (PWA) ready
- Install on iPhone via Safari
- Works offline after first load
- Responsive design for all screen sizes

### 🛠️ Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Framer Motion animations

### 📝 Known Issues
- Icon-192.png and icon-512.png missing (404 warnings)
- Quick Actions Menu marked for improvement

### 🚀 Getting Started
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:3000

Or deploy to Vercel for instant hosting!

### 📄 Documentation
See [README.md](README.md) for complete documentation.

---

**Full Changelog**: Initial release