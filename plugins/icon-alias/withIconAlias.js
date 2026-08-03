const { withAndroidManifest } = require('@expo/config-plugins');

const ALIASES = [
  { name: 'IconAlias1', icon: 'ic_icon1', enabled: true },
  { name: 'IconAlias2', icon: 'ic_icon2', enabled: false },
  { name: 'IconAlias3', icon: 'ic_icon3', enabled: false },
  { name: 'IconAlias4', icon: 'ic_icon4', enabled: false },
  { name: 'IconAlias5', icon: 'ic_icon5', enabled: false },
  { name: 'IconAlias6', icon: 'ic_icon6', enabled: false },
  { name: 'IconAlias7', icon: 'ic_icon7', enabled: false },
  { name: 'IconAlias8', icon: 'ic_icon8', enabled: false },
  { name: 'IconAlias9', icon: 'ic_icon9', enabled: false },
  { name: 'IconAlias10', icon: 'ic_icon10', enabled: false },
  { name: 'IconAlias11', icon: 'ic_icon11', enabled: false },
];

function withIconAlias(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const application = manifest.application[0];

    // Disable main activity
    const mainActivity = application.activity.find(a => a['$'].name === 'com.yuitodo.app.MainActivity');
    if (mainActivity) {
      mainActivity['$'].enabled = 'false';
    }

    // Add activity-aliases
    application['activity-alias'] = application['activity-alias'] || [];
    for (const alias of ALIASES) {
      application['activity-alias'].push({
        '$': {
          'name': `com.yuitodo.app.${alias.name}`,
          'targetActivity': 'com.yuitodo.app.MainActivity',
          'enabled': alias.enabled ? 'true' : 'false',
          'exported': 'true',
          'icon': `@mipmap/${alias.icon}`,
          'label': 'YuiTodo',
        },
        'intent-filter': [
          { action: [{ '$': { 'name': 'android.intent.action.MAIN' } }], 'category': [{ '$': { 'name': 'android.intent.category.LAUNCHER' } }] },
        ],
      });
    }

    return cfg;
  });
}

module.exports = withIconAlias;
