#!/usr/bin/env node
// Bundle size budget monitoring for enterprise deployments

const { statSync } = require('fs');
const { join } = require('path');

const projectRoot = join(__dirname, '..');

// Bundle size budgets (in bytes) - optimized for Webflow performance
const BUDGETS = {
  'hero-critical.iife.js': {
    max: 15000, // 15KB - back to performance-focused size
    warning: 12000, // 12KB
    gzipMax: 5000, // 5KB gzipped
    gzipWarning: 4000 // 4KB gzipped warning
  },
  'app.iife.js': {
    max: 23500, // 23.5KB - adjusted for phone validation + blur overlay features
    warning: 21000, // 21KB
    gzipMax: 8000, // 8KB gzipped
    gzipWarning: 7000 // 7KB gzipped warning
  }
};

function getFileSizeInBytes(filePath) {
  try {
    return statSync(filePath).size;
  } catch (error) {
    console.error(`❌ Could not read file: ${filePath}`);
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkBundle(filename, budget) {
  const filePath = join(projectRoot, 'dist', filename);
  const size = getFileSizeInBytes(filePath);
  
  if (size === 0) {
    return { filename, status: 'error', message: 'File not found' };
  }

  let status = 'ok';
  let message = `${formatBytes(size)}`;
  
  if (size > budget.max) {
    status = 'error';
    message += ` - EXCEEDS BUDGET (max: ${formatBytes(budget.max)})`;
  } else if (size > budget.warning) {
    status = 'warning';
    message += ` - Warning (approaching limit: ${formatBytes(budget.max)})`;
  } else {
    message += ` - OK (budget: ${formatBytes(budget.max)})`;
  }

  return { filename, status, size, message };
}

function generateReport() {
  console.log('📊 Bundle Size Budget Report\n');
  console.log('Generated:', new Date().toISOString());
  console.log('─'.repeat(60));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  Object.entries(BUDGETS).forEach(([filename, budget]) => {
    const result = checkBundle(filename, budget);
    
    const icon = result.status === 'error' ? '❌' : 
                 result.status === 'warning' ? '⚠️' : '✅';
    
    console.log(`${icon} ${result.filename}: ${result.message}`);
    
    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  });
  
  console.log('─'.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ Bundle budget check FAILED!');
    console.log('Some bundles exceed the maximum allowed size.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Bundle budget check passed with warnings.');
    console.log('Some bundles are approaching their size limits.');
  } else {
    console.log('\n✅ Bundle budget check PASSED!');
    console.log('All bundles are within acceptable size limits.');
  }
  
  return { hasErrors, hasWarnings };
}

// If run directly, generate report
if (require.main === module) {
  generateReport();
}