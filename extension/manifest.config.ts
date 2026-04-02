import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: "TERPCompare",
  version: "1.0.0",
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  permissions: [
    'contentSettings',
    'activeTab',
    'storage'
  ],
  host_permissions: [
    "https://terpcompare-production.up.railway.app/*",
    "https://app.testudo.umd.edu/*"
  ],
  background: {
    service_worker: "src/background.ts",
    type: "module"
  },
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['https://app.testudo.umd.edu/soc/*'],
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
