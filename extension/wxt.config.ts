import { loadEnv } from 'vite';
import { defineConfig } from 'wxt';

// Where the FastAPI backend lives. Override in .env.local with WXT_API_URL.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), 'WXT_');
const API_URL = env.WXT_API_URL || 'https://team5-backend-lnzk.onrender.com';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Veritas',
    description: 'Right-click any image to check whether it is likely AI-generated.',
    // Clicking the toolbar icon opens the Veritas side panel (Firefox: sidebar). See utils/panel.ts.
    action: { default_title: 'Open Veritas' },
    permissions: ['contextMenus', 'activeTab', 'scripting', 'storage'],
    host_permissions: [
      `${new URL(API_URL).origin}/*`,
      // The three supported sites: the hover button runs here.
      'https://x.com/*',
      'https://*.facebook.com/*',
      'https://*.youtube.com/*',
      // Where those sites serve their images from, so the background worker can download them.
      'https://pbs.twimg.com/*',
      'https://*.fbcdn.net/*',
      'https://i.ytimg.com/*',
    ],
    // Right-click on any other site, and the screenshot fallback for videos.
    // Requested the first time someone uses the right-click menu, never at install.
    optional_host_permissions: ['<all_urls>'],
    browser_specific_settings: {
      gecko: {
        // Firefox needs a stable ID. Change before publishing to addons.mozilla.org.
        id: 'veritas@techfleet.example',
        // Required by AMO for new extensions: declare what data leaves the browser.
        data_collection_permissions: { required: ['websiteContent'] },
      },
    },
  },
});
