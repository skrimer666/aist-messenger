/**
 * Скрипт для очистки кэша PWA
 * Используется для отладки и тестирования
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const PUBLIC_DIR = path.join(__dirname, '../public');

/**
 * Удалить папку
 */
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ Удалена папка: ${dirPath}`);
  }
}

/**
 * Очистить localStorage данные
 */
function clearLocalStorageFiles() {
  const files = [
    'aist_sync_queue',
    'aist_sync_state',
    'aist_last_sync',
    'aist_device_id',
    'aist_pwa_installed',
    'aist_pwa_dismissed'
  ];
  
  console.log('\nФайлы для очистки localStorage (в браузере):');
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  console.log('\nДля очистки откройте DevTools → Application → Local Storage и удалите эти ключи.');
}

/**
 * Очистить Service Worker кэш
 */
function clearServiceWorkerCache() {
  console.log('\nДля очистки Service Worker кэша в браузере:');
  console.log('  1. Откройте DevTools → Application → Service Workers');
  console.log('  2. Нажмите "Unregister" для всех service workers');
  console.log('  3. Перезагрузите страницу');
}

/**
 * Основная функция
 */
async function main() {
  console.log('=== Очистка кэша PWA ===\n');
  
  // Удаляем папку dist
  console.log('Удаление папки сборки...');
  removeDirectory(DIST_DIR);
  
  // Очищаем временные файлы
  console.log('\nУдаление временных файлов...');
  const tempFiles = [
    path.join(PUBLIC_DIR, 'workbox-*.js'),
    path.join(PUBLIC_DIR, 'precache-*.js')
  ];
  
  // Инструкция по очистке localStorage
  clearLocalStorageFiles();
  
  // Инструкция по очистке Service Worker
  clearServiceWorkerCache();
  
  console.log('\n✅ Очистка завершена!');
  console.log('\nСледующие шаги:');
  console.log('  1. Очистите localStorage в браузере (см. выше)');
  console.log('  2. Отключите Service Worker в браузере (см. выше)');
  console.log('  3. Пересоберите проект: npm run build');
  console.log('  4. Перезагрузите страницу');
}

// Запускаем
main();
