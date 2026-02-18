/**
 * Скрипт для генерации иконок разных размеров для PWA
 * Требует установленного ImageMagick или sharp
 */

const fs = require('fs');
const path = require('path');

// Размеры иконок для PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Путь к исходной иконке
const SOURCE_ICON = path.join(__dirname, '../public/icon.png');

// Путь для сохранения иконок
const OUTPUT_DIR = path.join(__dirname, '../public');

/**
 * Проверить наличие ImageMagick
 */
async function checkImageMagick() {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec('magick -version', (error) => {
      resolve(!error);
    });
  });
}

/**
 * Проверить наличие sharp
 */
function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Сгенерировать иконки с помощью ImageMagick
 */
async function generateWithImageMagick() {
  const { exec } = require('child_process');
  
  console.log('Генерация иконок с помощью ImageMagick...');
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    
    await new Promise((resolve, reject) => {
      exec(
        `magick "${SOURCE_ICON}" -resize ${size}x${size} "${outputPath}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Ошибка генерации ${size}x${size}:`, error);
            reject(error);
          } else {
            console.log(`✓ Сгенерирована иконка ${size}x${size}`);
            resolve();
          }
        }
      );
    });
  }
}

/**
 * Сгенерировать иконки с помощью sharp
 */
async function generateWithSharp() {
  const sharp = require('sharp');
  
  console.log('Генерация иконок с помощью sharp...');
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Сгенерирована иконка ${size}x${size}`);
  }
}

/**
 * Создать favicon.ico
 */
async function generateFavicon() {
  const { exec } = require('child_process');
  
  console.log('Генерация favicon.ico...');
  
  const faviconPath = path.join(OUTPUT_DIR, 'favicon.ico');
  
  // Используем ImageMagick для создания favicon.ico
  await new Promise((resolve, reject) => {
    exec(
      `magick "${SOURCE_ICON}" -resize 16x16 "${faviconPath}"`,
      (error) => {
        if (error) {
          console.warn('Не удалось создать favicon.ico:', error.message);
          resolve(); // Не критично
        } else {
          console.log('✓ Сгенерирован favicon.ico');
          resolve();
        }
      }
    );
  });
}

/**
 * Создать маскируемые иконки (для Android)
 */
async function generateMaskableIcons() {
  const sharp = require('sharp');
  
  console.log('Генерация маскируемых иконок...');
  
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}.png`);
    
    // Создаем прозрачный PNG с отступами для маскируемых иконок
    const padding = Math.floor(size * 0.1); // 10% отступ
    const innerSize = size - (padding * 2);
    
    const svgBuffer = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${size}" height="${size}" fill="transparent"/>
      </svg>
    `);
    
    await sharp(SOURCE_ICON)
      .resize(innerSize, innerSize, {
        fit: 'cover',
        position: 'center'
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Сгенерирована маскируемая иконка ${size}x${size}`);
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('=== Генерация иконок PWA ===\n');
  
  // Проверяем наличие исходной иконки
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Исходная иконка не найдена: ${SOURCE_ICON}`);
    console.log('Пожалуйста, создайте файл icon.png в папке public/');
    process.exit(1);
  }
  
  // Создаем папку если нужно
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Проверяем доступные инструменты
  const hasImageMagick = await checkImageMagick();
  const hasSharp = checkSharp();
  
  if (!hasImageMagick && !hasSharp) {
    console.error('❌ Не найден ни ImageMagick, ни sharp');
    console.log('Установите один из них:');
    console.log('  - ImageMagick: https://imagemagick.org/');
    console.log('  - sharp: npm install sharp');
    process.exit(1);
  }
  
  try {
    // Генерируем иконки
    if (hasSharp) {
      await generateWithSharp();
      await generateMaskableIcons();
    } else {
      await generateWithImageMagick();
    }
    
    // Генерируем favicon
    await generateFavicon();
    
    console.log('\n✅ Генерация иконок завершена!');
    console.log('\nСгенерированные файлы:');
    ICON_SIZES.forEach(size => {
      console.log(`  - icon-${size}.png`);
    });
    console.log('  - favicon.ico');
    
  } catch (error) {
    console.error('\n❌ Ошибка генерации иконок:', error);
    process.exit(1);
  }
}

// Запускаем
main();
