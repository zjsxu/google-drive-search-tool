/**
 * 运行任务 5.3: 错误信息有效性属性测试
 * **Feature: google-drive-search-tool, Property 7: 错误信息有效性**
 * **验证: 需求 3.4**
 */
function runTask5_3_ErrorMessageValidityPropertyTest() {
  console.log('\n=== 任务 5.3: 错误信息有效性属性测试 ===');
  
  try {
    // **Feature: google-drive-search-tool, Property 7: 错误信息有效性**
    // **验证: 需求 3.4**
    
    console.log('运行属性测试: 属性 7: 错误信息有效性');
    let passed = 0;
    let failed = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      try {
        // Property test function
        const handler = createExceptionHandler();
        
        // 生成随机的错误类型和详细信息
        const errorTypes = [
          {
            type: 'PERMISSION_ERROR',
            details: {
              resourceType: Math.random() < 0.5 ? 'file' : 'folder',
              resourceName: generateRandomResourceName(),
              resourceId: generateRandomId()
            }
          },
          {
            type: 'NETWORK_TIMEOUT',
            details: {
              operationName: generateRandomOperationName(),
              attempts: Math.floor(Math.random() * 5) + 1
            }
          },
          {
            type: 'QUOTA_EXCEEDED',
            details: {}
          },
          {
            type: 'INVALID_INPUT',
            details: {
              details: generateRandomValidationError()
            }
          },
          {
            type: 'FILE_NOT_FOUND',
            details: {}
          },
          {
            type: 'EXECUTION_TIMEOUT',
            details: {}
          }
        ];
        
        const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        // 对于任何搜索过程中发生的错误，系统应该提供清晰有意义的错误信息
        const userFriendlyMessage = handler.generateUserFriendlyErrorMessage(
          randomErrorType.type, 
          randomErrorType.details
        );
        
        // 验证错误信息的有效性属性
        
        // 1. 错误信息不应为空或null
        if (!userFriendlyMessage) {
          throw new Error('错误信息不应为空或null');
        }
        
        // 2. 错误信息应该是字符串类型
        if (typeof userFriendlyMessage !== 'string') {
          throw new Error('错误信息应该是字符串类型');
        }
        
        // 3. 错误信息应该有合理的长度（不能太短或太长）
        if (userFriendlyMessage.length < 10) {
          throw new Error('错误信息太短，应该提供更多有用信息');
        }
        if (userFriendlyMessage.length > 1000) {
          throw new Error('错误信息太长，应该更加简洁');
        }
        
        // 4. 错误信息应该包含时间戳
        const timestampPattern = /\[\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}:\d{2}\]|\[\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\]/;
        if (!timestampPattern.test(userFriendlyMessage)) {
          throw new Error('错误信息应该包含时间戳');
        }
        
        // 5. 根据错误类型验证特定的内容要求
        switch (randomErrorType.type) {
          case 'PERMISSION_ERROR':
            // 权限错误信息应该包含权限相关的关键词
            if (!userFriendlyMessage.includes('权限')) {
              throw new Error('权限错误信息应该包含"权限"关键词');
            }
            // 应该包含资源类型信息
            if (randomErrorType.details.resourceName && 
                !userFriendlyMessage.includes(randomErrorType.details.resourceName)) {
              throw new Error('权限错误信息应该包含资源名称');
            }
            // 应该提供继续处理的说明
            if (!userFriendlyMessage.includes('继续')) {
              throw new Error('权限错误信息应该说明会继续处理其他文件');
            }
            break;
            
          case 'NETWORK_TIMEOUT':
            // 网络超时错误应该包含超时相关信息
            if (!userFriendlyMessage.includes('超时') && !userFriendlyMessage.includes('网络')) {
              throw new Error('网络超时错误信息应该包含超时或网络关键词');
            }
            // 应该包含操作名称
            if (randomErrorType.details.operationName && 
                !userFriendlyMessage.includes(randomErrorType.details.operationName)) {
              throw new Error('网络超时错误信息应该包含操作名称');
            }
            // 应该包含重试次数信息
            if (randomErrorType.details.attempts && 
                !userFriendlyMessage.includes(randomErrorType.details.attempts.toString())) {
              throw new Error('网络超时错误信息应该包含重试次数');
            }
            break;
            
          case 'QUOTA_EXCEEDED':
            // 配额错误应该包含配额相关信息
            if (!userFriendlyMessage.includes('配额') && !userFriendlyMessage.includes('API')) {
              throw new Error('配额错误信息应该包含配额或API关键词');
            }
            // 应该提供解决建议
            if (!userFriendlyMessage.includes('增量搜索') && !userFriendlyMessage.includes('等待')) {
              throw new Error('配额错误信息应该提供解决建议');
            }
            break;
            
          case 'INVALID_INPUT':
            // 无效输入错误应该包含输入相关信息
            if (!userFriendlyMessage.includes('输入') && !userFriendlyMessage.includes('参数')) {
              throw new Error('无效输入错误信息应该包含输入或参数关键词');
            }
            // 应该提供检查建议
            if (!userFriendlyMessage.includes('检查') && !userFriendlyMessage.includes('确认')) {
              throw new Error('无效输入错误信息应该提供检查建议');
            }
            break;
            
          case 'FILE_NOT_FOUND':
            // 文件未找到错误应该包含相关信息
            if (!userFriendlyMessage.includes('不存在') && !userFriendlyMessage.includes('找到')) {
              throw new Error('文件未找到错误信息应该包含不存在或找到关键词');
            }
            break;
            
          case 'EXECUTION_TIMEOUT':
            // 执行超时错误应该包含超时信息
            if (!userFriendlyMessage.includes('超时') && !userFriendlyMessage.includes('时间')) {
              throw new Error('执行超时错误信息应该包含超时或时间关键词');
            }
            // 应该提供解决建议
            if (!userFriendlyMessage.includes('增量搜索') && !userFriendlyMessage.includes('缩小')) {
              throw new Error('执行超时错误信息应该提供解决建议');
            }
            break;
        }
        
        // 6. 错误信息应该是用户友好的（包含中文说明）
        const chinesePattern = /[\u4e00-\u9fa5]/;
        if (!chinesePattern.test(userFriendlyMessage)) {
          throw new Error('错误信息应该包含中文说明以便用户理解');
        }
        
        // 7. 错误信息不应该包含技术性的堆栈跟踪或内部错误代码
        const technicalPatterns = [
          /at\s+\w+\.\w+\(/,  // 堆栈跟踪
          /Error:\s*\w+Error/,  // 技术错误类型
          /\w+Exception/,  // 异常类名
          /line\s+\d+/i,  // 行号信息
          /stack\s*trace/i  // 堆栈跟踪关键词
        ];
        
        for (const pattern of technicalPatterns) {
          if (pattern.test(userFriendlyMessage)) {
            throw new Error('错误信息不应该包含技术性的堆栈跟踪或内部错误代码');
          }
        }
        
        // 8. 错误信息应该提供建设性的指导或下一步行动建议
        const actionKeywords = ['建议', '请', '可以', '应该', '检查', '确认', '重试', '等待', '联系'];
        const hasActionGuidance = actionKeywords.some(keyword => userFriendlyMessage.includes(keyword));
        if (!hasActionGuidance) {
          throw new Error('错误信息应该提供建设性的指导或下一步行动建议');
        }
        
        // 9. 验证错误信息的一致性 - 同样的错误类型应该产生结构相似的信息
        const anotherMessage = handler.generateUserFriendlyErrorMessage(
          randomErrorType.type, 
          randomErrorType.details
        );
        
        // 两次生成的消息应该有相同的基本结构（都包含时间戳，都是中文等）
        if (timestampPattern.test(userFriendlyMessage) !== timestampPattern.test(anotherMessage)) {
          throw new Error('相同错误类型的错误信息应该有一致的结构');
        }
        
        // 10. 验证错误信息不会泄露敏感信息
        const sensitivePatterns = [
          /password/i,
          /token/i,
          /secret/i,
          /key/i,
          /auth/i
        ];
        
        for (const pattern of sensitivePatterns) {
          if (pattern.test(userFriendlyMessage)) {
            throw new Error('错误信息不应该泄露敏感信息');
          }
        }
        
        passed++;
      } catch (error) {
        failed++;
        console.log(`迭代 ${i + 1} 失败: ${error.message}`);
        // 对于属性测试，记录第一个失败就停止
        if (failed === 1) {
          console.log(`属性测试失败，反例在迭代 ${i + 1}`);
          throw error;
        }
      }
    }

    console.log(`属性测试完成: ${passed}/${iterations} 通过`);
    
    console.log('✓ 任务 5.3: 错误信息有效性属性测试通过');
    return true;
    
  } catch (error) {
    console.log(`✗ 任务 5.3: 错误信息有效性属性测试失败: ${error.message}`);
    console.log(error.stack);
    return false;
  }
}

/**
 * 生成随机资源名称
 * @return {string} 随机资源名称
 */
function generateRandomResourceName() {
  const fileNames = [
    '项目文档.docx', 'report.pdf', '会议记录.txt', 'data.xlsx', 
    '分析报告.doc', 'presentation.pptx', '测试文件.txt', 'config.json',
    '用户手册.pdf', 'backup.zip', '图片.jpg', '视频.mp4'
  ];
  
  const folderNames = [
    '项目文件夹', 'Documents', '工作资料', 'Reports', 
    '会议资料', 'Data', '备份文件', 'Templates',
    '图片文件夹', '视频文件夹', '归档文件', '临时文件'
  ];
  
  const isFile = Math.random() < 0.7; // 70% 概率是文件
  const names = isFile ? fileNames : folderNames;
  
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * 生成随机ID
 * @return {string} 随机ID
 */
function generateRandomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = Math.floor(Math.random() * 17) + 28; // 28-44 characters
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机操作名称
 * @return {string} 随机操作名称
 */
function generateRandomOperationName() {
  const operations = [
    'searchFiles', 'getFileContent', 'traverseFolder', 'validateAccess',
    'downloadFile', 'uploadFile', 'createFolder', 'deleteFile',
    'moveFile', 'copyFile', 'shareFile', 'updatePermissions'
  ];
  
  return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * 生成随机验证错误详情
 * @return {string} 随机验证错误详情
 */
function generateRandomValidationError() {
  const validationErrors = [
    '文件夹ID格式不正确',
    '搜索关键词不能为空',
    '文件夹ID长度无效',
    '包含非法字符',
    '参数类型错误',
    '缺少必需参数',
    '参数值超出范围',
    '格式不符合要求'
  ];
  
  return validationErrors[Math.floor(Math.random() * validationErrors.length)];
}

/**
 * 简化版错误信息有效性测试（用于快速验证）
 */
function runTask5_3_BasicTest() {
  console.log('\n=== 任务 5.3: 错误信息有效性基础测试 ===');
  
  try {
    const handler = createExceptionHandler();
    
    // 测试权限错误信息
    const permissionMessage = handler.generateUserFriendlyErrorMessage('PERMISSION_ERROR', {
      resourceType: 'file',
      resourceName: 'test.txt'
    });
    
    if (!permissionMessage) {
      throw new Error('权限错误信息不应为空');
    }
    if (!permissionMessage.includes('权限')) {
      throw new Error('权限错误信息应该包含权限关键词');
    }
    if (!permissionMessage.includes('test.txt')) {
      throw new Error('权限错误信息应该包含文件名');
    }
    
    // 测试网络超时错误信息
    const timeoutMessage = handler.generateUserFriendlyErrorMessage('NETWORK_TIMEOUT', {
      operationName: 'searchFiles',
      attempts: 3
    });
    
    if (!timeoutMessage) {
      throw new Error('网络超时错误信息不应为空');
    }
    if (!timeoutMessage.includes('超时') && !timeoutMessage.includes('网络')) {
      throw new Error('网络超时错误信息应该包含相关关键词');
    }
    if (!timeoutMessage.includes('3')) {
      throw new Error('网络超时错误信息应该包含重试次数');
    }
    
    // 测试配额错误信息
    const quotaMessage = handler.generateUserFriendlyErrorMessage('QUOTA_EXCEEDED', {});
    
    if (!quotaMessage) {
      throw new Error('配额错误信息不应为空');
    }
    if (!quotaMessage.includes('配额') && !quotaMessage.includes('API')) {
      throw new Error('配额错误信息应该包含配额关键词');
    }
    
    // 验证所有错误信息都包含时间戳
    const messages = [permissionMessage, timeoutMessage, quotaMessage];
    const timestampPattern = /\[\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}:\d{2}\]|\[\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\]/;
    
    for (const message of messages) {
      if (!timestampPattern.test(message)) {
        throw new Error('所有错误信息都应该包含时间戳');
      }
    }
    
    console.log('✓ 错误信息有效性基础测试通过');
    return true;
    
  } catch (error) {
    console.log(`✗ 错误信息有效性基础测试失败: ${error.message}`);
    return false;
  }
}