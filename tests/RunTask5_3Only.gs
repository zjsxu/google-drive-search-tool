/**
 * 仅运行任务 5.3 的测试
 */
function runTask5_3Only() {
  console.log('=== 运行任务 5.3: 错误信息有效性属性测试 ===\n');
  
  try {
    // 先运行基础测试
    console.log('运行基础测试...');
    const basicResult = runTask5_3_BasicTest();
    
    if (basicResult) {
      console.log('\n基础测试通过，开始运行属性测试...');
      // 运行完整的属性测试
      const propertyResult = runTask5_3_ErrorMessageValidityPropertyTest();
      
      if (propertyResult) {
        console.log('\n✓ 任务 5.3 所有测试通过');
      } else {
        console.log('\n✗ 任务 5.3 属性测试失败');
      }
    } else {
      console.log('\n✗ 任务 5.3 基础测试失败');
    }
    
  } catch (error) {
    console.log(`\n任务 5.3 测试执行失败: ${error.message}`);
    console.log(error.stack);
  }
}

/**
 * 快速验证错误信息生成功能
 */
function quickValidateErrorMessages() {
  console.log('=== 快速验证错误信息生成功能 ===\n');
  
  try {
    const handler = createExceptionHandler();
    
    // 测试各种错误类型的信息生成
    const errorTypes = [
      {
        type: 'PERMISSION_ERROR',
        details: { resourceType: 'file', resourceName: 'test.txt' }
      },
      {
        type: 'NETWORK_TIMEOUT',
        details: { operationName: 'searchFiles', attempts: 3 }
      },
      {
        type: 'QUOTA_EXCEEDED',
        details: {}
      },
      {
        type: 'INVALID_INPUT',
        details: { details: '文件夹ID格式不正确' }
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
    
    console.log('生成的错误信息示例:');
    console.log('=' .repeat(50));
    
    errorTypes.forEach((errorType, index) => {
      const message = handler.generateUserFriendlyErrorMessage(errorType.type, errorType.details);
      console.log(`${index + 1}. ${errorType.type}:`);
      console.log(`   ${message}`);
      console.log('');
    });
    
    console.log('✓ 错误信息生成功能验证完成');
    
  } catch (error) {
    console.log(`✗ 错误信息生成功能验证失败: ${error.message}`);
  }
}