# travis-heavener/seniorresearch
## Travis Heavener's Senior Research Project

Utilizing Entertainment-Based Encouragement Tactics to Promote Physical Activity

## Changelog

### 1.0.2 (Pre-release)
* Child screens now remount when focusing home screen
* New users start with their daily card focused
* Added custom fonts (Alata & Josefin Sans)
* Incomplete screen swipes from home screen now don't remount home
* Added username change button on profile screen
* Screens can't be swiped beyond their content

### 1.0.1 (Pre-release)
* Added custom Swipe Navigator
    * Screens can be accessed via swipe or buttons from home
* Removed unused dependencies & updated existing ones

### 1.0.0 (Pre-release)
* Initial pre-release
* Implemented pedometer, GPS, and accelerometer APIs
    * Expo-Sensors and Expo-Location
* Added bingo cards
* Added user system
* Added rewards (themes & icons)

<br>

## Required React Native Libraries/APIs
The following code snippet shows required libraries and how to install them from a terminal:
```
# Stack Navigation dependencies
npm i @react-navigation/native
npm i @react-navigation/stack

# Expo Pedometer/Magnetometer
npm i expo-sensors

# Expo Geolocation
npm i expo-location

# AsyncStorage to store user config data
npm i @react-native-async-storage/async-storage

# EventEmitter for functional callbacks between screens
npm i eventemitter3

# EAS CLI
npm i expo-dev-client
npm i eas-cli

# Custom fonts
npm i @expo-google-fonts/alata
npm i @expo-google-fonts/josefin-sans
npm i expo-font
```