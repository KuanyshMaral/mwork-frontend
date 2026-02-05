// Test script to check castings API
import { castingApi } from './src/api/client.js';

async function testCastingsAPI() {
    try {
        console.log('Testing castings API without filters...');
        const result = await castingApi.list({});
        console.log('API Result:', result);
        console.log('Type:', typeof result);
        console.log('Is Array:', Array.isArray(result));
        console.log('Length:', result?.length);
        
        if (result && result.data) {
            console.log('Result.data:', result.data);
            console.log('Result.data is Array:', Array.isArray(result.data));
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}

testCastingsAPI();
