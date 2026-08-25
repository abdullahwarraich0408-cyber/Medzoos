/**
 * Low-RAM Android runner for Windows.
 * Caps Ninja/CMake parallel jobs so clang does not OOM compiling
 * react-native-reanimated (common on 16GB machines with Metro/Chrome open).
 */
const { spawnSync } = require('child_process');
const path = require('path');

process.env.CMAKE_BUILD_PARALLEL_LEVEL = '1';
process.env.NINJA_NUM_JOBS = '1';
// Prefer single-job cmake --build even if AGP passes --parallel
process.env.CMAKE_BUILD_PARALLEL_LEVEL = '1';

const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const filtered = args.filter(a => a !== '--dev');

const connect = spawnSync('npm', ['run', 'connect:android'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
  env: process.env,
});
if (connect.status !== 0) {
  process.exit(connect.status || 1);
}

const rnArgs = [
  'react-native',
  'run-android',
  '--port',
  '8081',
  '--active-arch-only',
  ...filtered,
];
if (isDev) {
  rnArgs.push('--no-packager');
}

const result = spawnSync('npx', rnArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
  env: process.env,
});

process.exit(result.status || 0);
