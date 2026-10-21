const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'warnOfExpoGoPushUsage.js'
);

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  if (content.includes("throw new Error(message);")) {
    content = content.replace(
      /if \(Platform\.OS === 'android'\) \{\s*throw new Error\(message\);\s*\}\s*else if \(__DEV__\) \{\s*didWarn = true;\s*console\.warn\(message\);\s*\}/g,
      'didWarn = true;\n        console.warn(message);'
    );
    fs.writeFileSync(target, content, 'utf8');
    console.log('[postinstall] Patched expo-notifications warnOfExpoGoPushUsage successfully.');
  }
}

const topicTargets = [
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'TopicSubscriptionModule.android.js'),
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'src', 'TopicSubscriptionModule.android.ts'),
];

for (const t of topicTargets) {
  if (fs.existsSync(t)) {
    let content = fs.readFileSync(t, 'utf8');
    if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')") || content.includes('requireNativeModule<TopicSubscriptionModule>(\'ExpoTopicSubscriptionModule\')')) {
      content = content
        .replace(/requireNativeModule/g, 'requireOptionalNativeModule')
        .replace(/'ExpoTopicSubscriptionModule'\);/g, "'ExpoTopicSubscriptionModule') ?? {};");
      fs.writeFileSync(t, content, 'utf8');
      console.log(`[postinstall] Patched ${path.basename(t)} successfully.`);
    }
  }
}

