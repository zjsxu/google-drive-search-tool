/**
 * ResultCollector类
 * 负责搜索结果收集和输出格式化
 * 实现需求 1.4, 1.5, 4.4, 4.5
 */

/**
 * ResultCollector - 结果收集器核心类
 * 实现搜索结果收集逻辑、结果格式化方法和输出功能
 */
class ResultCollector {
  constructor() {
    this.results = [];
    this.outputFormat = 'logger';
    this.sheetId = null;
    this.maxBatchSize = 100; // 批量写入的最大行数
  }

  /**
   * 收集单个搜索结果
   * 实现需求 1.4 - 提取文件的元数据信息包括文件名和访问链接
   * @param {GoogleAppsScript.Drive.File} file - Drive文件对象
   * @param {string} folderPath - 文件所在的完整路径
   * @return {SearchResult} 搜索结果对象
   */
  collectResult(file, folderPath) {
    try {
      // 提取文件元数据
      const fileName = file.getName();
      const fileUrl = file.getUrl();
      const fileType = this.getFileTypeName(file.getMimeType());
      const lastModified = file.getLastUpdated();

      // 创建搜索结果对象
      const searchResult = createSearchResult(
        fileName,
        fileUrl,
        folderPath,
        fileType,
        lastModified
      );

      // 添加到结果集合
      this.results.push(searchResult);

      console.log(`收集结果: ${fileName} (${fileType})`);
      return searchResult;

    } catch (error) {
      console.log(`收集结果时发生错误: ${error.message}`);
      // 返回null表示收集失败，但不中断整个过程
      return null;
    }
  }

  /**
   * 批量收集搜索结果
   * @param {FileMatch[]} fileMatches - 文件匹配数组
   * @return {SearchResult[]} 收集的搜索结果数组
   */
  collectResults(fileMatches) {
    const collectedResults = [];

    for (const fileMatch of fileMatches) {
      const result = this.collectResult(fileMatch.file, fileMatch.parentPath);
      if (result) {
        collectedResults.push(result);
      }
    }

    console.log(`批量收集完成，共收集 ${collectedResults.length} 个结果`);
    return collectedResults;
  }

  /**
   * 格式化搜索结果
   * 实现需求 1.5 - 生成包含文件名、文件链接和父级路径的结构化报告
   * @param {SearchResult[]} results - 搜索结果数组
   * @return {Object} 格式化的输出对象
   */
  formatResults(results = null) {
    const resultsToFormat = results || this.results;
    
    const formattedOutput = {
      summary: {
        totalFiles: resultsToFormat.length,
        searchDate: new Date(),
        fileTypes: this.getFileTypesSummary(resultsToFormat)
      },
      results: resultsToFormat.map(result => ({
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        folderPath: result.folderPath,
        fileType: result.fileType,
        lastModified: result.lastModified
      })),
      formattedText: this.generateFormattedText(resultsToFormat),
      csvData: this.generateCSVData(resultsToFormat)
    };

    console.log(`格式化完成，共 ${resultsToFormat.length} 个结果`);
    return formattedOutput;
  }

  /**
   * 输出结果到控制台日志
   * 实现需求 4.4 - 将结果输出到控制台
   * @param {SearchResult[]} results - 搜索结果数组（可选）
   */
  outputToLogger(results = null) {
    const resultsToOutput = results || this.results;
    const formattedOutput = this.formatResults(resultsToOutput);

    console.log('\n=== Google Drive 搜索结果 ===');
    console.log(`搜索时间: ${formattedOutput.summary.searchDate.toLocaleString()}`);
    console.log(`找到文件数量: ${formattedOutput.summary.totalFiles}`);
    
    // 输出文件类型统计
    console.log('\n文件类型统计:');
    for (const [fileType, count] of Object.entries(formattedOutput.summary.fileTypes)) {
      console.log(`  ${fileType}: ${count} 个文件`);
    }

    // 输出详细结果
    console.log('\n详细结果:');
    console.log('序号 | 文件名 | 文件类型 | 路径 | 链接');
    console.log('-----|--------|----------|------|------');
    
    resultsToOutput.forEach((result, index) => {
      console.log(`${index + 1} | ${result.fileName} | ${result.fileType} | ${result.folderPath} | ${result.fileUrl}`);
    });

    console.log('\n=== 搜索结果输出完成 ===\n');
  }

  /**
   * 输出结果到Google Sheet
   * 实现需求 4.5 - 创建包含文件名、链接和路径列的格式化表格
   * @param {SearchResult[]} results - 搜索结果数组（可选）
   * @param {string} sheetName - 工作表名称（可选）
   * @return {string} 创建的Google Sheet的ID
   */
  outputToSheet(results = null, sheetName = null) {
    try {
      const resultsToOutput = results || this.results;
      const defaultSheetName = sheetName || `搜索结果_${new Date().toISOString().slice(0, 10)}`;

      // 创建新的Google Sheet
      const spreadsheet = SpreadsheetApp.create(defaultSheetName);
      const sheet = spreadsheet.getActiveSheet();
      
      // 设置表头
      const headers = ['序号', '文件名', '文件类型', '文件夹路径', '文件链接', '最后修改时间'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // 格式化表头
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');

      // 准备数据
      const data = resultsToOutput.map((result, index) => [
        index + 1,
        result.fileName,
        result.fileType,
        result.folderPath,
        result.fileUrl,
        result.lastModified.toLocaleString()
      ]);

      // 批量写入数据
      if (data.length > 0) {
        this.batchWriteToSheet(sheet, data, 2); // 从第2行开始写入
      }

      // 自动调整列宽
      sheet.autoResizeColumns(1, headers.length);

      // 设置链接列为超链接格式
      if (data.length > 0) {
        const linkRange = sheet.getRange(2, 5, data.length, 1); // 第5列是链接列
        linkRange.setFontColor('#1155cc');
        linkRange.setFontLine('underline');
      }

      // 添加汇总信息
      this.addSummaryToSheet(sheet, resultsToOutput, data.length + 3);

      this.sheetId = spreadsheet.getId();
      const sheetUrl = spreadsheet.getUrl();

      console.log(`结果已输出到Google Sheet: ${sheetUrl}`);
      console.log(`Sheet ID: ${this.sheetId}`);

      return this.sheetId;

    } catch (error) {
      console.log(`输出到Google Sheet时发生错误: ${error.message}`);
      throw new Error(`无法创建Google Sheet: ${error.message}`);
    }
  }

  /**
   * 批量写入数据到Sheet
   * 实现需求 4.5 - 添加批量数据写入优化
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表对象
   * @param {Array[]} data - 要写入的数据
   * @param {number} startRow - 起始行号
   */
  batchWriteToSheet(sheet, data, startRow) {
    try {
      // 如果数据量小于批量大小，直接写入
      if (data.length <= this.maxBatchSize) {
        sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
        return;
      }

      // 分批写入大量数据
      let currentRow = startRow;
      for (let i = 0; i < data.length; i += this.maxBatchSize) {
        const batchData = data.slice(i, i + this.maxBatchSize);
        sheet.getRange(currentRow, 1, batchData.length, batchData[0].length).setValues(batchData);
        currentRow += batchData.length;
        
        console.log(`已写入批次 ${Math.floor(i / this.maxBatchSize) + 1}，共 ${batchData.length} 行`);
        
        // 添加短暂延迟以避免API限制
        if (i + this.maxBatchSize < data.length) {
          Utilities.sleep(100);
        }
      }

      console.log(`批量写入完成，总共写入 ${data.length} 行数据`);

    } catch (error) {
      console.log(`批量写入数据时发生错误: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加汇总信息到Sheet
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表对象
   * @param {SearchResult[]} results - 搜索结果
   * @param {number} startRow - 起始行号
   */
  addSummaryToSheet(sheet, results, startRow) {
    try {
      const fileTypesSummary = this.getFileTypesSummary(results);
      
      // 添加汇总标题
      sheet.getRange(startRow, 1).setValue('搜索汇总信息');
      sheet.getRange(startRow, 1).setFontWeight('bold').setFontSize(12);
      
      // 添加基本统计
      sheet.getRange(startRow + 1, 1).setValue('总文件数:');
      sheet.getRange(startRow + 1, 2).setValue(results.length);
      
      sheet.getRange(startRow + 2, 1).setValue('搜索时间:');
      sheet.getRange(startRow + 2, 2).setValue(new Date().toLocaleString());

      // 添加文件类型统计
      let currentRow = startRow + 4;
      sheet.getRange(currentRow, 1).setValue('文件类型统计:');
      sheet.getRange(currentRow, 1).setFontWeight('bold');
      
      currentRow++;
      for (const [fileType, count] of Object.entries(fileTypesSummary)) {
        sheet.getRange(currentRow, 1).setValue(fileType);
        sheet.getRange(currentRow, 2).setValue(count);
        currentRow++;
      }

    } catch (error) {
      console.log(`添加汇总信息时发生错误: ${error.message}`);
    }
  }

  /**
   * 获取文件类型统计
   * @param {SearchResult[]} results - 搜索结果数组
   * @return {Object} 文件类型统计对象
   */
  getFileTypesSummary(results) {
    const summary = {};
    
    results.forEach(result => {
      const fileType = result.fileType;
      summary[fileType] = (summary[fileType] || 0) + 1;
    });

    return summary;
  }

  /**
   * 生成格式化的文本输出
   * @param {SearchResult[]} results - 搜索结果数组
   * @return {string} 格式化的文本
   */
  generateFormattedText(results) {
    let text = `Google Drive 搜索结果报告\n`;
    text += `生成时间: ${new Date().toLocaleString()}\n`;
    text += `找到文件数量: ${results.length}\n\n`;

    // 文件类型统计
    const fileTypesSummary = this.getFileTypesSummary(results);
    text += `文件类型统计:\n`;
    for (const [fileType, count] of Object.entries(fileTypesSummary)) {
      text += `  ${fileType}: ${count} 个文件\n`;
    }
    text += `\n`;

    // 详细结果列表
    text += `详细结果:\n`;
    text += `${'序号'.padEnd(4)} | ${'文件名'.padEnd(30)} | ${'类型'.padEnd(15)} | ${'路径'.padEnd(40)} | 链接\n`;
    text += `${'-'.repeat(4)} | ${'-'.repeat(30)} | ${'-'.repeat(15)} | ${'-'.repeat(40)} | ${'-'.repeat(50)}\n`;

    results.forEach((result, index) => {
      const truncatedName = result.fileName.length > 30 ? 
        result.fileName.substring(0, 27) + '...' : result.fileName;
      const truncatedPath = result.folderPath.length > 40 ? 
        result.folderPath.substring(0, 37) + '...' : result.folderPath;
      
      text += `${String(index + 1).padEnd(4)} | ${truncatedName.padEnd(30)} | ${result.fileType.padEnd(15)} | ${truncatedPath.padEnd(40)} | ${result.fileUrl}\n`;
    });

    return text;
  }

  /**
   * 生成CSV格式数据
   * @param {SearchResult[]} results - 搜索结果数组
   * @return {string} CSV格式的数据
   */
  generateCSVData(results) {
    let csv = '序号,文件名,文件类型,文件夹路径,文件链接,最后修改时间\n';
    
    results.forEach((result, index) => {
      // 转义CSV中的特殊字符
      const escapedName = this.escapeCSVField(result.fileName);
      const escapedPath = this.escapeCSVField(result.folderPath);
      const escapedType = this.escapeCSVField(result.fileType);
      
      csv += `${index + 1},${escapedName},${escapedType},${escapedPath},${result.fileUrl},${result.lastModified.toLocaleString()}\n`;
    });

    return csv;
  }

  /**
   * 转义CSV字段中的特殊字符
   * @param {string} field - 字段值
   * @return {string} 转义后的字段值
   */
  escapeCSVField(field) {
    if (typeof field !== 'string') {
      return field;
    }
    
    // 如果包含逗号、引号或换行符，需要用引号包围并转义内部引号
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }

  /**
   * 获取文件类型的友好名称
   * @param {string} mimeType - MIME类型
   * @return {string} 友好的文件类型名称
   */
  getFileTypeName(mimeType) {
    const typeMap = {
      'application/vnd.google-apps.document': 'Google Docs',
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
      'text/plain': '文本文件',
      'application/vnd.google-apps.spreadsheet': 'Google Sheets'
    };
    
    return typeMap[mimeType] || '未知类型';
  }

  /**
   * 设置输出格式
   * @param {string} format - 输出格式 ('logger' 或 'sheet')
   */
  setOutputFormat(format) {
    if (format === 'logger' || format === 'sheet') {
      this.outputFormat = format;
      console.log(`输出格式设置为: ${format}`);
    } else {
      console.log(`无效的输出格式: ${format}，保持当前格式: ${this.outputFormat}`);
    }
  }

  /**
   * 获取当前输出格式
   * @return {string} 当前输出格式
   */
  getOutputFormat() {
    return this.outputFormat;
  }

  /**
   * 清空结果集合
   */
  clearResults() {
    this.results = [];
    console.log('结果集合已清空');
  }

  /**
   * 获取当前结果数量
   * @return {number} 结果数量
   */
  getResultCount() {
    return this.results.length;
  }

  /**
   * 获取所有结果
   * @return {SearchResult[]} 所有搜索结果
   */
  getAllResults() {
    return [...this.results];
  }

  /**
   * 根据文件类型过滤结果
   * @param {string} fileType - 文件类型
   * @return {SearchResult[]} 过滤后的结果
   */
  filterResultsByType(fileType) {
    return this.results.filter(result => result.fileType === fileType);
  }

  /**
   * 根据文件夹路径过滤结果
   * @param {string} folderPath - 文件夹路径
   * @return {SearchResult[]} 过滤后的结果
   */
  filterResultsByPath(folderPath) {
    return this.results.filter(result => result.folderPath.includes(folderPath));
  }

  /**
   * 按文件名排序结果
   * @param {boolean} ascending - 是否升序排列
   * @return {SearchResult[]} 排序后的结果
   */
  sortResultsByName(ascending = true) {
    const sortedResults = [...this.results];
    sortedResults.sort((a, b) => {
      const comparison = a.fileName.localeCompare(b.fileName);
      return ascending ? comparison : -comparison;
    });
    return sortedResults;
  }

  /**
   * 按修改时间排序结果
   * @param {boolean} ascending - 是否升序排列
   * @return {SearchResult[]} 排序后的结果
   */
  sortResultsByDate(ascending = true) {
    const sortedResults = [...this.results];
    sortedResults.sort((a, b) => {
      const comparison = a.lastModified.getTime() - b.lastModified.getTime();
      return ascending ? comparison : -comparison;
    });
    return sortedResults;
  }

  /**
   * 获取创建的Google Sheet ID
   * @return {string|null} Sheet ID
   */
  getSheetId() {
    return this.sheetId;
  }

  /**
   * 设置批量写入的最大行数
   * @param {number} batchSize - 批量大小
   */
  setBatchSize(batchSize) {
    if (typeof batchSize === 'number' && batchSize > 0) {
      this.maxBatchSize = batchSize;
      console.log(`批量写入大小设置为: ${batchSize}`);
    } else {
      console.log(`无效的批量大小: ${batchSize}`);
    }
  }

  /**
   * 获取结果统计信息
   * @return {Object} 统计信息对象
   */
  getStatistics() {
    const fileTypesSummary = this.getFileTypesSummary(this.results);
    
    return {
      totalFiles: this.results.length,
      fileTypes: fileTypesSummary,
      oldestFile: this.getOldestFile(),
      newestFile: this.getNewestFile(),
      averagePathLength: this.getAveragePathLength()
    };
  }

  /**
   * 获取最旧的文件
   * @return {SearchResult|null} 最旧的文件
   */
  getOldestFile() {
    if (this.results.length === 0) return null;
    
    return this.results.reduce((oldest, current) => 
      current.lastModified < oldest.lastModified ? current : oldest
    );
  }

  /**
   * 获取最新的文件
   * @return {SearchResult|null} 最新的文件
   */
  getNewestFile() {
    if (this.results.length === 0) return null;
    
    return this.results.reduce((newest, current) => 
      current.lastModified > newest.lastModified ? current : newest
    );
  }

  /**
   * 获取平均路径长度
   * @return {number} 平均路径长度
   */
  getAveragePathLength() {
    if (this.results.length === 0) return 0;
    
    const totalLength = this.results.reduce((sum, result) => 
      sum + result.folderPath.length, 0
    );
    
    return Math.round(totalLength / this.results.length);
  }
}

/**
 * 创建ResultCollector实例的工厂函数
 * @return {ResultCollector} ResultCollector实例
 */
function createResultCollector() {
  return new ResultCollector();
}