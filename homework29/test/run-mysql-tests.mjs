import { loadEnvFile } from 'node:process';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import mysql from 'mysql2/promise';

loadEnvFile('.env');
// Each run owns a fresh database so the homework data is never modified.
const database = `homework28_test_${randomBytes(8).toString('hex')}`;
const connection = await mysql.createConnection({
  host: process.env.SQL_HOST,
  port: Number(process.env.SQL_PORT ?? 3306),
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
});
try {
  await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  const result = spawnSync(process.execPath, [
    '--experimental-vm-modules',
    'node_modules/jest/bin/jest.js',
    '--config', 'test/jest-e2e.json', '--runInBand',
  ], {
    stdio: 'inherit',
    env: { ...process.env, TEST_MYSQL_DATABASE: database },
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
  await connection.end();
}
