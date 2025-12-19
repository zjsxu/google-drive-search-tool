/**
 * 任务8验证脚本
 * 简单验证主入口函数和配置管理是否正确实现
 */

function verifyTask8Implementation() {
  console.log('=== 验证任务8实现 ===\n');
  
  let allPassed = true;
  
  // 1. 验证配置管理器存在
  console.log('1. 验证配置管理器...');
  try {
    const configManager = createConfigurationManager();
    if (!configManager) {
      console.log('✗ 配置管理器创建失败');
      allPassed = false;
    } else {
      console.log('✓ 配置管理器创建成功');
      
      // 验证默认配置
      const defaultConfig = configManager.getDefaultConfiguration();
      if (!defaultConfig || !defaultConfig.search || !defaultConfig.output) {
        console.log('✗ 默认配置结构不完整');
        allPassed = false;
      } else {
        console.log('✓ 默认配置结构完整');
      }
      
      // 验证配置方法
      const currentConfig = configManager.getCurrentConfiguration();
      if (!currentConfig) {
        console.log('✗ 无法获取当前配置');
        allPassed = false;
      } else {
        console.log('✓ 可以获取当前配置');
      }
    }
  } catch (error) {
    console.log('✗ 配置管理器验证失败:', error.message);
    allPassed = false;
  }
  
  // 2. 验证全局配置管理器
  console.log('\n2. 验证全局配置管理器...');
  try {
    const globalManager = getGlobalConfigurationManager();
    if (!globalManager) {
      console.log('✗ 全局配置管理器获取失败');
      allPassed = false;
    } else {
      console.log('✓ 全局配置管理器获取成功');
    }
  } catch (error) {
    console.log('✗ 全局配置管理器验证失败:', error.message);
    allPassed = false;
  }
  
  // 3. 验证主搜索函数存在
  console.log('\n3. 验证主搜索函数...');
  try {
    if (typeof searchGoogleDrive !== 'function') {
      console.log('✗ searchGoogleDrive函数不存在');
      allPassed = false;
    } else {
      console.log('✓ searchGoogleDrive函数存在');
    }
    
    if (typeof searchGoogleDriveIncremental !== 'function') {
      console.log('✗ searchGoogleDriveIncremental函数不存在');
      allPassed = false;
    } else {
      console.log('✓ searchGoogleDriveIncremental函数存在');
    }
    
    if (typeof simpleSearch !== 'function') {
      console.log('✗ simpleSearch函数不存在');
      allPassed = false;
    } else {
      console.log('✓ simpleSearch函数存在');
    }
  } catch (error) {
    console.log('✗ 主搜索函数验证失败:', error.message);
    allPassed = false;
  }
  
  // 4. 验证配置管理接口函数
  console.log('\n4. 验证配置管理接口函数...');
  try {
    const functions = [
      'getCurrentConfig',
      'setSearchConfig',
      'resetConfig',
      'exportConfig',
      'importConfig',
      'setDefaultOutputFormat',
      'setDefaultBatchSize',
      'setIncrementalSearchEnabled',
      'addCustomFileType',
      'getSupportedFileTypes'
    ];
    
    let missingFunctions = [];
    for (const funcName of functions) {
      if (typeof eval(funcName) !== 'function') {
        missingFunctions.push(funcName);
      }
    }
    
    if (missingFunctions.length > 0) {
      console.log('✗ 缺少配置管理接口函数:', missingFunctions.join(', '));
      allPassed = false;
    } else {
      console.log('✓ 所有配置管理接口函数都存在');
    }
  } catch (error) {
    console.log('✗ 配置管理接口函数验证失败:', error.message);
    allPassed = false;
  }
  
  // 5. 验证预设配置函数
  console.log('\n5. 验证预设配置函数...');
  try {
    const presetFunctions = [
      'setQuickSearchConfig',
      'setDeepSearchConfig',
      'setPerformanceOptimizedConfig',
      'quickSearch',
      'deepSearch',
      'performanceSearch'
    ];
    
    let missingPresets = [];
    for (const funcName of presetFunctions) {
      if (typeof eval(funcName) !== 'function') {
        missingPresets.push(funcName);
      }
    }
    
    if (missingPresets.length > 0) {
      console.log('✗ 缺少预设配置函数:', missingPresets.join(', '));
      allPassed = false;
    } else {
      console.log('✓ 所有预设配置函数都存在');
    }
  } catch (error) {
    console.log('✗ 预设配置函数验证失败:', error.message);
    allPassed = false;
  }
  
  // 6. 验证辅助函数
  console.log('\n6. 验证辅助函数...');
  try {
    const helperFunctions = [
      'batchSearch',
      'getFolderStructure',
      'getFileTypeStatistics',
      'testSearchTool'
    ];
    
    let missingHelpers = [];
    for (const funcName of helperFunctions) {
      if (typeof eval(funcName) !== 'function') {
        missingHelpers.push(funcName);
      }
    }
    
    if (missingHelpers.length > 0) {
      console.log('✗ 缺少辅助函数:', missingHelpers.join(', '));
      allPassed = false;
    } else {
      console.log('✓ 所有辅助函数都存在');
    }
  } catch (error) {
    console.log('✗ 辅助函数验证失败:', error.message);
    allPassed = false;
  }
  
  // 7. 验证配置管理器功能
  console.log('\n7. 验证配置管理器功能...');
  try {
    const configManager = getGlobalConfigurationManager();
    
    // 测试配置设置
    configManager.setUserConfiguration({
      search: { maxResults: 999 }
    });
    
    const config = configManager.getCurrentConfiguration();
    if (config.search.maxResults !== 999) {
      console.log('✗ 配置设置功能不正常');
      allPassed = false;
    } else {
      console.log('✓ 配置设置功能正常');
    }
    
    // 测试配置重置
    configManager.resetToDefault();
    const resetConfig = configManager.getCurrentConfiguration();
    if (resetConfig.search.maxResults === 999) {
      console.log('✗ 配置重置功能不正常');
      allPassed = false;
    } else {
      console.log('✓ 配置重置功能正常');
    }
    
    // 测试配置导出
    const exported = configManager.exportConfiguration();
    if (typeof exported !== 'string' || exported.length === 0) {
      console.log('✗ 配置导出功能不正常');
      allPassed = false;
    } else {
      console.log('✓ 配置导出功能正常');
    }
    
  } catch (error) {
    console.log('✗ 配置管理器功能验证失败:', error.message);
    allPassed = false;
  }
  
  // 总结
  console.log('\n=== 验证结果 ===');
  if (allPassed) {
    console.log('✓ 任务8实现验证通过 - 所有功能都已正确实现');
  } else {
    console.log('✗ 任务8实现验证失败 - 部分功能存在问题');
  }
  
  return allPassed;
}
