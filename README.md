# travis-heavener/seniorresearch
## Travis Heavener's Senior Research Project

Utilizing Entertainment-Based Encouragement Tactics to Promote Physical Activity
___
## Table of Contents
* [About](#about)
* [Screenshots](#screenshots)
* [Changelog](#changelog)
* [Dependencies](#dependencies)
* [Known Issues](#known-issues)
___

## About
This app utilizes device sensors and user input to record spatial movement that tracks a user's physical activity.

By offering rewards users are more motivated to return, promoting positive lifestyle habits.

___

## Screenshots
<img src="screenshots/1.0.3-pr%20screenshot%20(6).jpg" width="150"/> | <img src="screenshots/1.0.3-pr%20screenshot%20(2).jpg" width="150"/> | <img src="screenshots/1.0.3-pr%20screenshot%20(1).jpg" width="150"/> | <img src="screenshots/1.0.3-pr%20screenshot%20(3).jpg" width="150"/> | <img src="screenshots/1.0.3-pr%20screenshot%20(4).jpg" width="150"/> | <img src="screenshots/1.0.3-pr%20screenshot%20(5).jpg" width="150"/>
:--:|:--:|:--:|:--:|:--:|:--:
*Sign-Up Screen* | *Home Screen* | *Profile Screen* | *Tasks Screen* | *Rewards Screen* | *Settings Screen*
___

## Changelog

### 1.0.6 (Pre-release) "The Performance Update"
* Adjusted formatting of Home Screen icons
* Fixed formatting for card selector (appears when no card is selected for display)
* Fixed navigation context not working in Main.js when leaving Signup Screen
* Fixed lifetime bingos and cards completed not updating on Profile Screen
* Added completion bar to objective tiles that are multi-complete & step/distance based
    * Added animation to progression
* Fixed progress bar not updating on Profile & Rewards focus
* Greatly improved remounting efficiency when switching to new screens
    * Compass now doesn't reset on home screen focus (this really bothered me)
* Fixed pedometer so that when it is restarted it now doesn't overwrite current steps
* Added pause feature to Settings screen
    * Stops all sensors & game loop functions (saves lots of battery usage)
* Added border to "Submit" button when resetting user data
* Card objective display's progress bar reading now clamps at maximum for completion
* Fixed Dev's Note lagging when pressing close & not opening after resetting data
* Clicking off the TOS modal when in the Settings menu now closes (since it's already been read)
* Fixed formatting for Tasks Screen when using the dark theme
* GREATLY improved data saving time efficiency by ~10x (~275 ms --> ~25 ms)
    * Prevents storing unchanged data by caching in memory what's been saved to the disk for checking against live data
* SwipeNavigator now accounts for offset from Tasks & Settings Screens' non-100% height (more smooth swiping)
* Reorganized components into subfolders based on their screen use cases
* Optimized card display remounting (only if a tile has changed) by ~2x (~275 ms --> ~130 ms)
* Fixed swipe gestures working with Dev's Note open
* Fixed overswiping (ie. swiping the left screen in from a right-side touch)

### 1.0.5 (Pre-release)
* Added Dev's Note safety notice on app open
* Unitalicized progress bar text (Alata 400 font now works)
* Added titles to user profile
    * Trainee; Novice; Rookie; Trainer; Champion; Olympian; and Legend
* Added new objectives (ie. fire hydrant, street nameplates)
* Added multi-completion objectives
* Fixed profile & rewards screens not updating with live progress
* Fixed lifetime steps & distance not saving/loading properly
* Fixed remounting when switching back to home screen

### 1.0.4 (Pre-release)
* Added Terms and Conditions
    * Must be accepted to use app
    * Minimum age to use: 13 years of age
* Added Privacy Policy
* Added Credits
* Maximum username length 14 characters -> 10 characters
* Fixed game loop not restarting after resetting user data
* Sensors stop when on signup screen with game tick
* Switched AsyncStorage for more-secure Expo Secure Store
    * react-native-gzip compresses JSON-stringified data to save SecureStore space
* Selecting a card on the Tasks Screen remounts the Home Screen
* Swipe navigation is disabled while a modal is open
* After changing username, the modal's text field now resets to "Player" when opened again
* Added Android back button functionality to SwipeNavigator
    * Returns to Home Screen if on another non-Signup Screen; or
    * Runs default function if pressed on Home Screen (closes app)

### 1.0.3 (Pre-release)
* Fixed dependency issues while EAS building (Expo Doctor step)
* Fixed logic with objective display modal (getting type of each objective, bug only present in EAS preview build?)
* Fixed logic with random objective generation for exploration objectives
    * One of each exploration goal per card, up to 25 random attempts where it selects the last randomization

### 1.0.2 (Pre-release)
* Child screens now remount when focusing home screen
* New users start with their daily card focused
* Added custom fonts (Alata & Josefin Sans)
* Incomplete screen swipes from home screen now don't remount home
* Added username change button on profile screen
    * Data is saved upon name change
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

___

## Dependencies
Expo SDK & Related Modules
```
@expo/config-plugins@^5.0.2
@expo/prebuild-config@^5.0.5
expo@~47.0.3
expo-dev-client@~2.0.1
expo-font@~11.0.1
expo-location@~15.0.1
expo-sensors@~12.0.1
```
React Native & Related Modules
```
@react-navigation/native@^6.1.6
@react-navigation/stack@^6.3.16
react@18.1.0
react-native@^0.70.8
react-native-gesture-handler@~2.8.0
react-native-safe-area-context@^4.4.1
react-native-screens@~3.18.0
```

EventEmitters, SecureStorage, fonts, & misc.
```
expo-secure-storage@~12.0.0
@expo-google-fonts/alata@^0.2.3
@expo-google-fonts/josefin-sans@^0.2.3
eventemitter3@^5.0.1
react-native-gzip@^1.0.0
```

Other Deps.
```
eas-cli@^3.1.1
```

___

## Known Issues
1) EAS preview build doesn't always follow the same logic as development build
    * ~~Checking for frequent duplicate explore objectives works on dev but not preview builds~~
        * Added dictionary to store what objectives are on card
        * Max of one of each exploration goal per card
    * ~~Checking for objective type when displaying ObjectiveConfirmModal doesn't work (when using [card objective].constructor.name)~~
        * Fixed by adding objType property to all objectives
    * [Solved] [object].constructor.name isn't working with EAS preview builds for some reason