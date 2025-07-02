#!/bin/bash

# Build script for NotificationsControl app bundle

set -e

# Build the Swift binary
echo "Building Swift binary..."
swift build --configuration=release

# Create app bundle structure
echo "Creating app bundle..."
mkdir -p NotificationsControl.app/Contents/MacOS
mkdir -p NotificationsControl.app/Contents/Resources

# Copy the binary
cp .build/release/NotificationsControl NotificationsControl.app/Contents/MacOS/

# Copy Info.plist
cp Info.plist NotificationsControl.app/Contents/

# Make the binary executable
chmod +x NotificationsControl.app/Contents/MacOS/NotificationsControl

# Create a wrapper script for command-line usage
cat > notifications_control << 'EOF'
#!/bin/bash
# Wrapper script to run the app bundle
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/NotificationsControl.app/Contents/MacOS/NotificationsControl" "$@"
EOF

chmod +x notifications_control

echo "Build complete! App bundle created at NotificationsControl.app"
echo "Command-line wrapper created at notifications_control" 