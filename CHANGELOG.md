# Changelog

All notable changes to the Fitness Tracker app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2024-04-25

### Added
- OCR body scan extraction from images
- Intelligent InBody scan parsing
- Automatic extraction of weight, body fat %, muscle mass, BMR
- Support for multiple body scan formats
- Error handling and validation for scan data

## [1.1.0] - 2024-04-25

### Added
- Smart goal-based fitness system with AI recommendations
- Three fitness goals: Visible Abs, Muscle Gain, Athletic Maintenance
- Scientifically-backed calorie calculations (Mifflin-St Jeor + Katch-McArdle)
- Goal-specific macro targets and personalized recommendations
- Activity level selection (sedentary to very active)
- Height, age, and gender tracking in body composition
- Profile information auto-populated from latest logs
- Edit buttons for single entry displays
- Duplicate prevention for same-date entries
- In-app changelog system with auto-show on updates

### Changed
- Profile Settings redesigned with read-only computed fields
- Weight now sourced from daily weight log
- Body composition form includes profile fields
- "Recalc from Profile" now uses smart goal system
- Body composition and daily weight prevent duplicates per date

### Fixed
- Daily Overview spacing issue with overlapping text
- Calorie and water display visibility

## [1.0.0] - 2024-04-25

### Added
- Initial release
- Workout logging with calisthenics focus
- Nutrition tracking with macro breakdown
- Cardio activity logging
- Body composition tracking
- Smart notifications system
- Weekly recap feature
- PWA support for iPhone
- Dark mode support
