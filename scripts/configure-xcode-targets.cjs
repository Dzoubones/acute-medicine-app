/* Idempotent project generator for the native review targets. Run after a fresh
 * `cap add ios`; normal `cap sync ios` preserves the generated target entries. */
const fs = require('node:fs');
const xcode = require('xcode');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const project = xcode.project(projectPath);

function targetConfigurations(target) {
  const list = project.hash.project.objects.XCConfigurationList[target.pbxNativeTarget.buildConfigurationList];
  return list.buildConfigurations.map(item => project.hash.project.objects.XCBuildConfiguration[item.value]);
}

function configure(target, settings) {
  for (const configuration of targetConfigurations(target)) Object.assign(configuration.buildSettings, settings);
}

project.parse(error => {
  if (error) throw error;
  const objects = project.hash.project.objects;
  objects.PBXContainerItemProxy ||= {};
  objects.PBXTargetDependency ||= {};
  const appTarget = project.getFirstTarget().uuid;
  const appGroup = Object.entries(objects.PBXGroup).find(([, value]) => value?.path === 'App')?.[0];
  const rootGroup = project.getFirstProject().firstProject.mainGroup;

  if (!project.hasFile('MainViewController.swift')) project.addSourceFile('MainViewController.swift', { target: appTarget }, appGroup);
  if (!project.hasFile('AMTNativeFeaturesPlugin.swift')) project.addSourceFile('AMTNativeFeaturesPlugin.swift', { target: appTarget }, appGroup);
  if (!project.hasFile('AMTAppIntents.swift')) project.addSourceFile('AMTAppIntents.swift', { target: appTarget }, appGroup);
  if (!project.hasFile('App.entitlements')) project.addFile('App.entitlements', appGroup);

  let widgetKey = project.findTargetKey('"AMTWidgets"') || project.findTargetKey('AMTWidgets');
  if (!widgetKey) {
    const group = project.addPbxGroup(['AMTWidgets/AMTWidgets.swift', 'AMTWidgets/Info.plist', 'AMTWidgets/AMTWidgets.entitlements'], 'AMTWidgets', '');
    project.addToPbxGroup(group.uuid, rootGroup);
    const target = project.addTarget('AMTWidgets', 'app_extension', 'AMTWidgets', 'uk.acutemedicine.acutemedicaltake.widgets');
    project.addBuildPhase(['AMTWidgets/AMTWidgets.swift'], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    configure(target, {
      APPLICATION_EXTENSION_API_ONLY: 'YES', CODE_SIGN_ENTITLEMENTS: 'AMTWidgets/AMTWidgets.entitlements', CODE_SIGN_STYLE: 'Automatic',
      CURRENT_PROJECT_VERSION: '2', DEVELOPMENT_TEAM: 'WY6W336UZG', GENERATE_INFOPLIST_FILE: 'NO', INFOPLIST_FILE: 'AMTWidgets/Info.plist',
      IPHONEOS_DEPLOYMENT_TARGET: '17.0', MARKETING_VERSION: '1.0.0', PRODUCT_BUNDLE_IDENTIFIER: 'uk.acutemedicine.acutemedicaltake.widgets',
      PRODUCT_NAME: '"$(TARGET_NAME)"', SDKROOT: 'iphoneos', SKIP_INSTALL: 'YES', SWIFT_VERSION: '5.0', TARGETED_DEVICE_FAMILY: '"1,2"'
    });
  }

  let watchKey = project.findTargetKey('"AMTWatch"') || project.findTargetKey('AMTWatch');
  if (!watchKey) {
    const group = project.addPbxGroup(['AMTWatch/AMTWatchApp.swift', 'AMTWatch/Info.plist'], 'AMTWatch', '');
    project.addToPbxGroup(group.uuid, rootGroup);
    const target = project.addTarget('AMTWatch', 'watch2_app', 'AMTWatch', 'uk.acutemedicine.acutemedicaltake.watch');
    project.addBuildPhase(['AMTWatch/AMTWatchApp.swift'], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    configure(target, {
      CODE_SIGN_STYLE: 'Automatic', CURRENT_PROJECT_VERSION: '2', DEVELOPMENT_TEAM: 'WY6W336UZG', GENERATE_INFOPLIST_FILE: 'NO',
      INFOPLIST_FILE: 'AMTWatch/Info.plist', MARKETING_VERSION: '1.0.0', PRODUCT_BUNDLE_IDENTIFIER: 'uk.acutemedicine.acutemedicaltake.watch',
      PRODUCT_NAME: '"$(TARGET_NAME)"', SDKROOT: 'watchos', SKIP_INSTALL: 'YES', SWIFT_VERSION: '5.0', TARGETED_DEVICE_FAMILY: '4', WATCHOS_DEPLOYMENT_TARGET: '10.0'
    });
  }

  for (const configuration of Object.values(objects.XCBuildConfiguration)) {
    if (!configuration?.buildSettings) continue;
    if (configuration.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === 'uk.acutemedicine.acutemedicaltake') {
      configuration.buildSettings.CURRENT_PROJECT_VERSION = '2';
      configuration.buildSettings.MARKETING_VERSION = '1.0.0';
      configuration.buildSettings.CODE_SIGN_ENTITLEMENTS = 'App/App.entitlements';
      configuration.buildSettings.DEVELOPMENT_TEAM = 'WY6W336UZG';
      configuration.buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator"';
    }
    delete configuration.buildSettings.CODE_SIGN_IDENTITY;
  }

  fs.writeFileSync(projectPath, project.writeSync());
});
