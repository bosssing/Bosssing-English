const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * 从Excel文件中读取单词数据
 * @param {string} filePath - Excel文件路径
 * @returns {Array<{word: string, phonetic: string, definition: string}>} 单词列表
 */
function parseExcelFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const words = [];
  for (const row of rawData) {
    if (!row || row.length === 0 || !row[0]) continue;
    words.push({
      word: String(row[0] || '').trim(),
      phonetic: String(row[1] || '').trim(),
      definition: String(row[2] || '').trim()
    });
  }

  return words;
}

/**
 * 查找项目目录下的Excel文件
 * @param {string} dir - 搜索目录
 * @returns {string|null} 找到的Excel文件路径
 */
function findExcelFile(dir) {
  const extensions = ['.xlsx', '.xls'];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        return path.join(dir, file);
      }
    }
  } catch (e) {
    console.error('搜索Excel文件失败:', e);
  }
  return null;
}

module.exports = { parseExcelFile, findExcelFile };
