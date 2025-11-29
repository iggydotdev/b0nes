#!/usr/bin/env node
// src/framework/cli.js

/**
 * b0nes CLI - Because typing long commands is for chumps
 * 
 * Usage:
 *   node src/framework/cli.js build [options]
 *   node src/framework/cli.js dev [options]
 *   node src/framework/cli.js clean
 */

import { build, clearBuildCache } from './utils/build/ssg.js';
import startServer from './server.js';
import fs from 'node:fs';


// Parse CLI arguments the old-fashioned way
const args = process.argv.slice(2);
const command = args[0];

// Parse flags
const flags = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    clean: args.includes('--clean'),
    parallel: args.includes('--parallel') || args.includes('-p'),
    noCache: args.includes('--no-cache'),
    port: parseInt(args.find(arg => arg.startsWith('--port='))?.split('=')[1]) || 5000,
    host: args.find(arg => arg.startsWith('--host='))?.split('=')[1] || '0.0.0.0',
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'public',
    help: args.includes('--help') || args.includes('-h')
};

/**
 * Print help text
 */
const printHelp = () => {
    console.log(`
🦴 b0nes CLI

USAGE:
  node src/framework/cli.js <command> [options]

COMMANDS:
  build       Build static site (SSG)
  dev         Start development server
  clean       Clear build cache

BUILD OPTIONS:
  --verbose, -v       Verbose logging
  --clean             Clean output directory before build
  --parallel, -p      Build routes in parallel (faster)
  --no-cache          Disable build cache

DEV OPTIONS:
  --port=<port>       Server port (default: 5000)
  --host=<host>       Server host (default: 0.0.0.0)
  --verbose, -v       Verbose logging

EXAMPLES:
  node src/framework/cli.js build --verbose
  node src/framework/cli.js build --clean --parallel
  node src/framework/cli.js dev --port=3000
  node src/framework/cli.js clean

PACKAGE.JSON SCRIPTS:
  "scripts": {
    "build": "node src/framework/cli.js build",
    "build:verbose": "node src/framework/cli.js build --verbose",
    "build:clean": "node src/framework/cli.js build --clean --parallel",
    "dev": "node src/framework/cli.js dev",
    "dev:verbose": "node src/framework/cli.js dev --verbose",
    "clean": "node src/framework/cli.js clean"
  }
`);
};

/**
 * Build command
 */
const runBuild = async () => {
    console.log('🦴 b0nes Build\n');
    
    const options = {
        cache: !flags.noCache,
        clean: flags.clean,
        parallel: flags.parallel,
        verbose: flags.verbose,
        continueOnError: true,
        generateSSRStubs: true
    };
    
    if (flags.verbose) {
        console.log('Build options:', options, '\n');
    }
    
    try {
        const result = await build('public', options);
        
        if (result.success) {
            console.log('✅ Build successful!');
            process.exit(0);
        } else {
            console.error('⚠️  Build completed with errors');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        if (flags.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

/**
 * Dev server command
 */
const runDev = () => {
    console.log('🦴 b0nes Dev Server\n');
    
    if (flags.verbose) {
        console.log('Server options:', {
            port: flags.port,
            host: flags.host,
            verbose: flags.verbose
        }, '\n');
    }
    
    try {
        startServer(flags.port, flags.host);
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        if (flags.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

/**
 * Clean command
 */
const runClean = () => {
    console.log('🦴 b0nes Clean\n');
    
    try {
        // Clear build cache
        clearBuildCache();
        console.log('✅ Cache cleared');
        
        // Remove output directory
        if (fs.existsSync(flags.outputDir)) {
            fs.rmSync(flags.outputDir, { recursive: true, force: true });
            console.log(`✅ Removed ${flags.outputDir}`);
        }
        
        console.log('\n✅ Clean completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to clean:', error.message);
        if (flags.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

/**
 * Main CLI handler
 */
const main = () => {
    // Show help
    if (flags.help || !command) {
        printHelp();
        process.exit(0);
    }
    
    // Route to command
    switch (command) {
        case 'build':
            runBuild();
            break;
            
        case 'dev':
        case 'serve':
            runDev();
            break;
            
        case 'clean':
            runClean();
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}\n`);
            printHelp();
            process.exit(1);
    }
};

// Run CLI
main();