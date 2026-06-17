/**
 * Chrome 扩展打包脚本 — 生成私钥 & 打包 .crx / .zip
 * 
 * 用法:
 *   node scripts/package-extension.mjs              → 构建 + 打包 .zip
 *   node scripts/package-extension.mjs --crx        → 构建 + 打包 .crx（需 Chrome）
 *   node scripts/package-extension.mjs --key-gen    → 仅生成私钥
 * 
 * 私钥 (.pem) 用于签名 .crx 文件。
 * Chrome Web Store 提交只需 .zip，私钥由 CWS 管理。
 * 自托管分发才需要 .crx + .pem。
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EXT_DIST = join(ROOT, 'dist-extension');
const KEY_DIR  = join(ROOT, 'extension', 'keys');
const KEY_PATH = join(KEY_DIR, 'lfw-extension.pem');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
const VERSION = pkg.version;

// --- 生成私钥 ---
function generate_key() {
  if (existsSync(KEY_PATH)) {
    console.log(`[pkg] Key already exists: ${KEY_PATH}`);
    return;
  }
  mkdirSync(KEY_DIR, { recursive: true });

  // 使用 Node.js crypto 生成 RSA 私钥 (PKCS#8)
  const { generateKeyPairSync } = await_import('crypto');
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(KEY_PATH, privateKey);
  console.log(`[pkg] ✅ Private key generated: ${KEY_PATH}`);
  console.log(`[pkg] ⚠️  KEEP THIS FILE SAFE! Do NOT commit to git.`);
}

function await_import(name) {
  return import(name);
}

// --- 查找 Chrome 可执行文件 ---
function find_chrome() {
  const platform = process.platform;
  if (platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
    return 'chrome'; // fallback to PATH
  }
  if (platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return 'google-chrome';
}

// --- 打包 .crx ---
async function pack_crx() {
  if (!existsSync(KEY_PATH)) {
    console.log('[pkg] No private key found. Generating...');
    await generate_key();
  }

  const chrome = find_chrome();
  console.log(`[pkg] Using Chrome: ${chrome}`);

  const crxPath = join(ROOT, 'release', `lfw-extension-v${VERSION}.crx`);
  mkdirSync(dirname(crxPath), { recursive: true });

  try {
    execSync(
      `"${chrome}" --pack-extension="${EXT_DIST}" --pack-extension-key="${KEY_PATH}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
    // Chrome creates dist-extension.crx next to the folder
    const generatedCrx = join(dirname(EXT_DIST), 'dist-extension.crx');
    if (existsSync(generatedCrx)) {
      const { renameSync } = await import('fs');
      renameSync(generatedCrx, crxPath);
    }
    console.log(`[pkg] ✅ CRX: ${crxPath}`);
    console.log(`[pkg] ✅ 私钥: ${KEY_PATH} (请妥善保管！)`);
  } catch {
    console.log(`[pkg] ⚠️  Chrome 打包失败。`);
    console.log(`[pkg] → 手动打包: chrome://extensions → 打包扩展程序`);
    console.log(`[pkg] → 扩展目录: ${EXT_DIST}`);
    console.log(`[pkg] → 私钥文件: ${KEY_PATH}`);
  }
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--key-gen')) {
    await generate_key();
    return;
  }

  // Build first
  console.log('[pkg] Building extension...');
  execSync('node scripts/build-extension.mjs', { cwd: ROOT, stdio: 'inherit' });

  if (args.includes('--crx')) {
    await pack_crx();
  } else {
    // Default: create .zip for Chrome Web Store
    const zipPath = join(ROOT, 'release', `lfw-extension-v${VERSION}.zip`);
    mkdirSync(dirname(zipPath), { recursive: true });
    try {
      execSync(`npx bestzip "${zipPath}" dist-extension/`, { cwd: ROOT, stdio: 'inherit' });
      console.log(`[pkg] ✅ ZIP (Chrome Web Store ready): ${zipPath}`);
    } catch {
      console.log(`[pkg] ⚠️  bestzip not found. Run: npm i -D bestzip`);
      console.log(`[pkg] → Or manually zip the dist-extension/ folder`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
