#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo " Mudaliandan Thirumaligai - Android"
echo " Debug APK Build"
echo "======================================"

# Move to project root (folder containing this script)
cd "$(dirname "$0")"

# ---------------------------------------------------------------
# JDK 21 setup (Capacitor 7+ needs Java 21)
# Edit JDK21_HOME if your JDK 21 lives somewhere else.
# ---------------------------------------------------------------
JDK21_HOME="/c/Program Files/Java/jdk-21.0.12.1"

if [[ -d "$JDK21_HOME" ]]; then
    export JAVA_HOME="$JDK21_HOME"
    export PATH="$JAVA_HOME/bin:$PATH"
fi

command -v node >/dev/null || { echo "ERROR: Node.js not found"; exit 1; }
command -v java >/dev/null || { echo "ERROR: Java not found"; exit 1; }

JAVA_MAJOR=$(java -version 2>&1 | awk -F[\".] '/version/ {print $2; exit}')
if [[ "$JAVA_MAJOR" -lt 21 ]]; then
    echo "ERROR: JDK 21 required, but found Java $JAVA_MAJOR."
    echo "Check JDK21_HOME at the top of this script: $JDK21_HOME"
    exit 1
fi
echo "Using Java $JAVA_MAJOR (JAVA_HOME=$JAVA_HOME)"

echo ""
echo "[1/4] Building Angular production app... and generating icons"
npm run build
npx capacitor-assets generate --android --iconBackgroundColor "#ffffff" --iconBackgroundColorDark "#000000"

echo ""
echo "[2/4] Syncing Capacitor Android..."
npx cap sync android

echo ""
echo "[3/4] Stopping old Gradle daemons (so they don't reuse Java 17)..."
(cd android && ./gradlew --stop)

echo ""
echo "[4/4] Building Android debug APK..."
(cd android && ./gradlew assembleDebug)

APK="android/app/build/outputs/apk/debug/app-debug.apk"

if [[ -f "$APK" ]]; then
    echo ""
    echo "======================================"
    echo " BUILD SUCCESSFUL!"
    echo "======================================"
    echo ""
    echo "APK location:"
    echo "$APK"
    echo ""
    echo "Install on a connected device with:"
    echo "adb install -r \"$APK\""
else
    echo "ERROR: APK file not found!"
    exit 1
fi