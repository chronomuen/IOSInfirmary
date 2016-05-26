CheckUP
=====================

A personal health record application for patients of the University Health Service of the University of the Philippines Diliman. This project was done for the completion of the requirements of our undergrad studies in Computer Science.

## Using this project

Downloading the dependencies:

1. Download and install node.js from their website at https://nodejs.org
2. If connected to the internet via a proxy server, enter the following commands in the command line:

  ```bash
  $ npm config set proxy http://foobar.com:8888
  $ npm config set https-proxy http://foobar.com:8888
  ```
  wherein foobar.com is the proxy address and 8888 is the port number
  
3. Download Ionic and Cordova via npm by inputting the following command in the command line (may need sudo privileges):
  
  ```bash
  $ npm install -g ionic cordova
  ```

Building the project using ionic:

1. Navigate to the project directory using the command line
2. The plugins and the platforms used should be installed from the package.json file, and this is done using:
  ```bash
  $ ionic state reset
  ```
  
3. After updating, the user may already build the project in the platform of his choice using:
  
  ```bash
  $ ionic build ios
  $ ionic build android
  ```
  
4. From the project directory, the builds for the specifc platform may befound at "platforms/ios/" for iOS devices, and "platforms/android/build/outputs/apk/" for android devices

Installation for iOS devices:

1. Open the XCode project found at "platforms/ios/", or at where the user placed it if it's no longer with the other source codes
2. Connect the iPad, or iOS device of choice, to the Macbook or iMac
3. Build the project, and wait for the application to successfully install to the device

Installation for Android devices:

1. Connect the Android device, with USB debugging turned on, to the computer
2. Either
  1. enter the following in the command line while at the project directory
  
    ```bash
    $ ionic run android
    ```
    
  2. or copy the APK file found at "platforms/android/build/outputs/apk/", or at where the user placed it if it's no longer with the othersource codes, to the device and open it there

3. Wait for the application to successfully install to the device
