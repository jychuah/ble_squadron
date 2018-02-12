### Control App for Imperial Raider

This app is built in [Ionic Framework](https://ionicframework.com). To deploy this app, you first need to:

- Install [NodeJS](https://nodejs.org)
- Install Ionic with `npm install -g ionic`
- Initialize this app with `ionic`

After initializing this app, you can use it in two ways:

- Emulate it in your computer's browser with `ionic lab`
- Deploy it to an Android or iOS Device by following [these instructions](https://ionicframework.com/docs/intro/deploying/)

Some notes for creating an Android APK file, on a Mac. First, some software installs:

- Install [JDK 1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) not JDK 9!
- Manually install `gradle`. If you have [brew](https://brew.sh/) it's easy with `brew install gradle`
- Install Android Studio

Next, edit your `~/.bash_profile` and make sure these environment variables are set:

```
# Your JAVA_HOME may vary slightly, depending on which JDK revision you installed. I installed 161.
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_161.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin
```

