
# File Downloader - React Native Android App

A beautiful and modern file downloader app for Android built with React Native. Download files by simply pasting a link!

## Features

✨ **Core Features:**
- 📋 Paste links from clipboard with one tap
- ⬇️ Download files from any URL
- 📊 Real-time download progress tracking
- 📁 View all downloaded files
- 🗑️ Delete downloaded files
- 🎨 Beautiful, modern UI with gradients and animations
- 🌙 Dark theme optimized

## Screenshots

The app features a stunning dark-themed interface with:
- Gradient headers and buttons
- Real-time progress bars
- Material Design icons
- Smooth animations and transitions

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Android Studio** with Android SDK
- **JDK 17** or higher
- **React Native CLI**

### Android Development Environment Setup

1. Install Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
3. Set up environment variables:
   - `ANDROID_HOME` = path to Android SDK (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Add to PATH: `%ANDROID_HOME%\platform-tools`
   - Add to PATH: `%ANDROID_HOME%\tools`

## Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Link Native Dependencies:**
   ```bash
   npx react-native link react-native-vector-icons
   ```

## Running the App

### Start Metro Bundler

In the project directory, start the Metro bundler:

```bash
npm start
```

### Run on Android Device/Emulator

In a new terminal window:

```bash
npm run android
```

Or using React Native CLI directly:

```bash
npx react-native run-android
```

## Permissions

The app requires the following Android permissions:
- `INTERNET` - To download files from the internet
- `READ_EXTERNAL_STORAGE` - To read downloaded files
- `WRITE_EXTERNAL_STORAGE` - To save downloaded files
- `ACCESS_NETWORK_STATE` - To check network connectivity

These permissions are automatically requested when the app starts.

## Project Structure

```
file-downloader/
├── android/                 # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/filedownloader/
│   │   │   └── res/
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── App.tsx                  # Main application component
├── index.js                 # Entry point
├── package.json             # Dependencies
└── README.md               # This file
```

## How to Use

1. **Launch the app** on your Android device or emulator
2. **Paste a download link** in the input field (or tap the paste icon to paste from clipboard)
3. **Tap the Download button** to start downloading
4. **Monitor progress** in real-time with the progress bar
5. **View all downloads** in the Downloads section
6. **Delete files** by tapping the delete icon on any download

## Supported File Types

The app can download any file type accessible via HTTP/HTTPS URL:
- Documents (PDF, DOC, DOCX, etc.)
- Images (JPG, PNG, GIF, etc.)
- Videos (MP4, AVI, MKV, etc.)
- Audio (MP3, WAV, etc.)
- Archives (ZIP, RAR, etc.)
- And more!

## Dependencies

Key dependencies used in this project:
- `react-native` - Core framework
- `react-native-fs` - File system access
- `@react-native-clipboard/clipboard` - Clipboard functionality
- `react-native-vector-icons` - Material Design icons
- `react-native-linear-gradient` - Gradient backgrounds
- `react-native-permissions` - Permission handling

## Troubleshooting

### Common Issues

**1. Metro Bundler fails to start:**
```bash
npx react-native start --reset-cache
```

**2. Build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**3. Permission errors:**
- Make sure you've accepted storage permissions when the app requests them
- For Android 11+, you may need to enable "All files access" in app settings

**4. Module not found errors:**
```bash
rm -rf node_modules
npm install
cd android
./gradlew clean
cd ..
```

## Building APK

To build a release APK:

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

## Future Enhancements

Potential features for future versions:
- [ ] Pause and resume downloads
- [ ] Download queue management
- [ ] File type filtering
- [ ] Download history
- [ ] Share downloaded files
- [ ] Custom download location
- [ ] Download speed indicator
- [ ] Multiple simultaneous downloads
- [ ] Dark/Light theme toggle

## License

This project is open source and available under the MIT License.

**Made with ❤️ using React Native**
