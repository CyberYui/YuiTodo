// 修复脚本：解决expo-sqlite 14.0.x在Node 20+环境下的ESM兼容性问题
// 此脚本在npm install后自动运行，修复模块导出路径
const fs = require('fs');
const path = require('path');

// expo-sqlite模块路径（使用process.cwd()因为脚本在scripts/子目录中）
const moduleDir = path.join(process.cwd(), 'node_modules', 'expo-sqlite');
const buildDir = path.join(moduleDir, 'build');
const packageJsonPath = path.join(moduleDir, 'package.json');

// 检查模块是否存在
if (!fs.existsSync(moduleDir)) {
  console.log('[patch] expo-sqlite未安装，跳过修复');
  process.exit(0);
}

try {
  // 1. 修复build/index.js：给相对导入加上.js扩展名
  const indexPath = path.join(buildDir, 'index.js');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    // 只在未修复时修改
    if (content.includes("from './SQLiteDatabase'")) {
      const fixed = content
        .replace("from './SQLiteDatabase'", "from './SQLiteDatabase.js'")
        .replace("from './SQLiteStatement'", "from './SQLiteStatement.js'")
        .replace("from './hooks'", "from './hooks.js'");
      fs.writeFileSync(indexPath, fixed);
      console.log('[patch] 修复 build/index.js 完成');
    }
  }

  // 2. 修复package.json：添加缺失的子路径exports
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let modified = false;

    if (!pkg.exports['./SQLiteDatabase']) {
      pkg.exports['./SQLiteDatabase'] = {
        default: './build/SQLiteDatabase.js',
        types: './build/SQLiteDatabase.d.ts',
      };
      modified = true;
    }
    if (!pkg.exports['./SQLiteStatement']) {
      pkg.exports['./SQLiteStatement'] = {
        default: './build/SQLiteStatement.js',
        types: './build/SQLiteStatement.d.ts',
      };
      modified = true;
    }
    if (!pkg.exports['./hooks']) {
      pkg.exports['./hooks'] = {
        default: './build/hooks.js',
        types: './build/hooks.d.ts',
      };
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
      console.log('[patch] 修复 package.json exports 完成');
    }
  }

  console.log('[patch] expo-sqlite兼容性修复完成');
} catch (error) {
  console.error('[patch] 修复失败:', error.message);
  // 不退出，避免影响整体install
}
