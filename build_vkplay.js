const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

const bundleOrder = [
  'i18n.js',
  'audio.js',
  'particles.js',
  'pets.js',
  'biomes.js',
  'ranks.js',
  'wheel.js',
  'upgrades.js',
  'codex.js',
  'missions.js',
  'enemies.js',
  'tower.js',
  'vkplay_bridge.js',
  'game.js'
];

console.log('1. Building game.bundle.js from src/...');
let bundleParts = [];
for (const file of bundleOrder) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf8').trim();
  bundleParts.push(`// --- BEGIN src/${file} ---\n${code}\n// --- END src/${file} ---`);
}
const bundleContent = bundleParts.join('\n\n') + '\n';
fs.writeFileSync(path.join(rootDir, 'game.bundle.js'), bundleContent, 'utf8');
console.log(`game.bundle.js built successfully (${bundleContent.length} bytes).`);

console.log('2. Reading style.css...');
const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8').trim();

console.log('3. Extracting body markup from index.html...');
const oldIndex = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Match body HTML between </style> and <script>\n// --- BEGIN
const bodyMatch = oldIndex.match(/<\/style>[\r\n]+([\s\S]*?)[\r\n]+<script>[\r\n]+\/\/ --- BEGIN/);
if (!bodyMatch) {
  throw new Error('Could not extract body markup from index.html');
}
let bodyHtml = bodyMatch[1].trim();

// Clean up any remaining Yandex references in markup
bodyHtml = bodyHtml.replace(
  '<div class="game-subtitle">ТОП-10 ЛУЧШИХ ЗАЩИТНИКОВ ЯНДЕКС ИГР</div>',
  '<div class="game-subtitle" data-i18n="hallOfFameTop">ТОП-10 ЛУЧШИХ ЗАЩИТНИКОВ БАШНИ</div>'
);

console.log('4. Assembling index.html...');
const indexHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#020208">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <title>Кибер Башня: Космический Автошутер | VK Play</title>
  <meta name="description" content="Кибер Башня: Космический Автошутер — научно-фантастический авто-шутер и рогалик. Управляйте башней, прокачивайте лазеры, собирайте дронов и побеждайте мега-боссов!">
  <script>
    // Suppress expected postMessage rejection when running outside platform iframe in local dev
    window.addEventListener('unhandledrejection', function(event) {
      if (event && event.reason) {
        var msg = event.reason.message || String(event.reason);
        if (msg.indexOf('No parent to post message') !== -1 || msg.indexOf('Can not get appId') !== -1) {
          event.preventDefault();
        }
      }
    });
    window.addEventListener('error', function(e) {
      if (e && e.message && (e.message.indexOf('No parent to post message') !== -1 || e.message.indexOf('Can not get appId') !== -1)) {
        e.preventDefault();
        return true;
      }
    });
  </script>
  <!-- VK Bridge SDK (VK Play / VK Mini Apps / VK Games) -->
  <script src="vk-bridge.min.js"></script>
  <script>
    window.isGameInteractive = false;
    window.isGameReadyFired = false;
    window.fireGameReady = function() {
      if (window.isGameReadyFired || !window.isGameInteractive) return;
      try {
        if (window.vkPlayBridge && typeof window.vkPlayBridge.notifyGameReady === 'function') {
          window.vkPlayBridge.notifyGameReady();
        }
        window.isGameReadyFired = true;
        console.log('[VK Play SDK] Game ready fired successfully.');
      } catch(e) {
        console.warn('[VK Play SDK] Game ready error:', e);
      }
    };

    // Audio suspend & mute on blur / backgrounding
    function handleEarlyMute(mute) {
      if (window.soundEngine && typeof window.soundEngine.setSystemMuted === 'function') {
        if (!mute && window.vkPlayBridge && window.vkPlayBridge.isAdShowing) return;
        window.soundEngine.setSystemMuted(mute);
      }
    }
    document.addEventListener('visibilitychange', function() { handleEarlyMute(document.hidden); });
    window.addEventListener('blur', function() { handleEarlyMute(true); });
    window.addEventListener('focus', function() { if (!document.hidden) handleEarlyMute(false); });
    window.addEventListener('pagehide', function() { handleEarlyMute(true); });
    window.addEventListener('pageshow', function() { if (!document.hidden) handleEarlyMute(false); });
  </script>
  <style>
${styleCss}
  </style>
</head>
${bodyHtml}

<script>
${bundleContent}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDir, 'index.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'cyber_tower_game.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'index_standalone.html'), indexHtml, 'utf8');
console.log(`index.html & clones written successfully (${indexHtml.length} bytes).`);

console.log('5. Creating vk-hosting-config.json...');
const hostingConfig = {
  static_path: '.',
  app_id: 1,
  endpoints: {
    mobile: 'index.html',
    mvk: 'index.html',
    web: 'index.html'
  }
};
fs.writeFileSync(path.join(rootDir, 'vk-hosting-config.json'), JSON.stringify(hostingConfig, null, 2) + '\n', 'utf8');

console.log('Build script finished successfully!');
