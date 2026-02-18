/**
 * Скрипт для проверки PWA с помощью Lighthouse
 * Требует установленный Chrome и lighthouse
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, 'pwa-report.html');

/**
 * Создать папку для отчетов
 */
function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
}

/**
 * Запустить Lighthouse
 */
async function runLighthouse(url) {
  return new Promise((resolve, reject) => {
    console.log(`Запуск Lighthouse для: ${url}\n`);
    
    const command = `lighthouse ${url} --output=html --output-path=${REPORT_FILE} --view --only-categories=pwa`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Ошибка запуска Lighthouse:', error.message);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

/**
 * Проверить наличие необходимых файлов
 */
function checkPWAFiles() {
  console.log('\n=== Проверка файлов PWA ===\n');
  
  const requiredFiles = [
    { path: 'public/manifest.json', description: 'Manifest' },
    { path: 'public/sw.js', description: 'Service Worker' },
    { path: 'public/icon-192.png', description: 'Icon 192x192' },
    { path: 'public/icon-512.png', description: 'Icon 512x512' }
  ];
  
  let allExists = true;
  
  requiredFiles.forEach(({ path: filePath, description }) => {
    const fullPath = path.join(__dirname, '..', filePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      console.log(`✓ ${description}: ${filePath}`);
    } else {
      console.log(`✗ ${description}: ${filePath} (не найден)`);
      allExists = false;
    }
  });
  
  return allExists;
}

/**
 * Проверить manifest.json
 */
function checkManifest() {
  console.log('\n=== Проверка manifest.json ===\n');
  
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('✗ manifest.json не найден');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'background_color',
      'theme_color',
      'icons'
    ];
    
    let allValid = true;
    
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`✓ ${field}: ${JSON.stringify(manifest[field])}`);
      } else {
        console.log(`✗ ${field}: отсутствует`);
        allValid = false;
      }
    });
    
    // Проверка иконок
    if (manifest.icons && Array.isArray(manifest.icons)) {
      console.log(`\n✓ Иконок: ${manifest.icons.length}`);
      manifest.icons.forEach(icon => {
        console.log(`  - ${icon.sizes}: ${icon.src}`);
      });
    }
    
    return allValid;
  } catch (error) {
    console.error('✗ Ошибка чтения manifest.json:', error.message);
    return false;
  }
}

/**
 * Проверить Service Worker
 */
function checkServiceWorker() {
  console.log('\n=== Проверка Service Worker ===\n');
  
  const swPath = path.join(__dirname, '../public/sw.js');
  
  if (!fs.existsSync(swPath)) {
    console.log('✗ sw.js не найден');
    return false;
  }
  
  const swContent = fs.readFileSync(swPath, 'utf-8');
  
  const requiredEvents = [
    'install',
    'activate',
    'fetch'
  ];
  
  let allValid = true;
  
  requiredEvents.forEach(event => {
    if (swContent.includes(`addEventListener('${event}'`)) {
      console.log(`✓ ${event} event`);
    } else {
      console.log(`✗ ${event} event: отсутствует`);
      allValid = false;
    }
  });
  
  // Проверка кэширования
  if (swContent.includes('caches.open') || swContent.includes('cache.addAll')) {
    console.log('✓ Кэширование реализовано');
  } else {
    console.log('✗ Кэширование не найдено');
    allValid = false;
  }
  
  return allValid;
}

/**
 * Основная функция
 */
async function main() {
  console.log('=== Проверка PWA AIST Messenger ===\n');
  
  // Проверяем наличие Lighthouse
  exec('lighthouse --version', (error) => {
    if (error) {
      console.log('⚠ Lighthouse не установлен');
      console.log('Установите: npm install -g lighthouse\n');
    } else {
      console.log('✓ Lighthouse установлен\n');
    }
  });
  
  // Создаем папку для отчетов
  ensureReportDir();
  
  // Проверяем файлы
  const filesOk = checkPWAFiles();
  
  // Проверяем manifest
  const manifestOk = checkManifest();
  
  // Проверяем Service Worker
  const swOk = checkServiceWorker();
  
  // Итог
  console.log('\n=== Результаты проверки ===\n');
  
  if (filesOk && manifestOk && swOk) {
    console.log('✅ Все проверки пройдены!');
    console.log('\nДля полной проверки запустите:');
    console.log('  npm run pwa:lighthouse-full');
  } else {
    console.log('❌ Некоторые проверки не пройдены');
    console.log('Исправьте указанные проблемы и повторите проверку.');
  }
}

/**
 * Полная проверка с Lighthouse
 */
async function runFullCheck() {
  console.log('=== Полная проверка PWA с Lighthouse ===\n');
  
  // Сначала базовые проверки
  await main();
  
  // Затем Lighthouse
  const url = process.env.PWA_URL || 'http://localhost:5173';
  
  console.log('\nЗапуск полной проверки...');
  console.log('Убедитесь, что сервер запущен: npm run dev\n');
  
  try {
    await runLighthouse(url);
    console.log('\n✅ Проверка завершена!');
    console.log(`Отчет сохранен: ${REPORT_FILE}`);
  } catch (error) {
    console.error('\n❌ Ошибка проверки:', error.message);
  }
}

// Если передан аргумент --full, запускаем полную проверку
if (process.argv.includes('--full')) {
  runFullCheck();
} else {
  main();
}
