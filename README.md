# Pet Watch - Pet Adoption App

A mobile app where you can browse pets available for adoption, see their details, and go through a mock adoption process.

## What you need installed first

- Node.js (version 18 or newer) - Download from https://nodejs.org
- A phone simulator:
  - iPhone users: Xcode (from Mac App Store)
  - Android users: Android Studio (from https://developer.android.com/studio)

## How to run the app

1. **Download the project**

   ```
   git clone <repository-url>
   cd pet-watch-task
   ```

2. **Install everything the app needs**

   ```
   npm install
   ```

3. **Start the app**

   ```
   npm start
   ```

4. **Open on your phone/simulator**

   After running `npm start`, you'll see options. Press:

   - `i` for iPhone simulator
   - `a` for Android simulator
   - Or scan the QR code with your phone using the Expo Go app

## How to use the app

1. When you open the app, it will show you a list of pets
2. Tap on any pet to see more details about them
3. If you want to "adopt" a pet, tap the "Adopt [Pet Name]" button
4. Fill out the form with your information
5. Complete the mock payment process
6. You'll see a success message

Note: This is just for demonstration - no real adoptions or payments happen.

## If something goes wrong

- Make sure Node.js is installed correctly
- Make sure your phone simulator is working
- Try running `npm install` again if you get errors
- Restart the app with `npm start`
