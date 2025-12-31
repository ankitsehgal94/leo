/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'LeoWidget',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.leo.shared'],
  },
  frameworks: ['SwiftUI', 'WidgetKit'],
  // Include all files in the widget folder
  resources: ['./Assets.xcassets'],
};
