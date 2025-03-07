// DeepSeek API Debug Script

/**
 * A simple script to debug the DeepSeek API connection
 */

const apiKey = 'sk-9e1d3d964afe4f03ac89eb638f176303';
const apiUrl = 'https://api.deepseek.com/v1';
const modelId = 'deepseek-coder-33b-instruct';

// Helper function to log the result
const logResult = (title, data) => {
  console.log('====================');
  console.log(title);
  console.log('====================');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n');
};

// Test the API connection
const testApiConnection = async () => {
  try {
    console.log('Testing DeepSeek API connection...');
    
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in JSON format.' }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      logResult('API Error', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      return false;
    }
    
    logResult('API Success', responseData);
    return true;
  } catch (error) {
    logResult('Exception', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Export a function to run the test
export const runDeepSeekTest = async () => {
  const result = await testApiConnection();
  return {
    success: result,
    timestamp: new Date().toISOString(),
    apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'Not provided',
    apiUrl,
    modelId
  };
};

// Run the test if used directly
if (typeof window !== 'undefined') {
  window.testDeepSeek = runDeepSeekTest;
  console.log('DeepSeek API test function added to window.testDeepSeek');
} 