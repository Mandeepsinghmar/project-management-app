/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react() as any, tsconfigPaths() as any],
  define: {
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
      'https://fake-for-vitest-define.supabase.co'
    ),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
      'fake-anon-key-for-vitest-define'
    ),
    'process.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(
      'fake-service-role-key-for-vitest-define'
    ),
    'process.env.DATABASE_URL': JSON.stringify(
      'postgresql://test:test@localhost:5439/testdb_define'
    ),
    'process.env.NEXTAUTH_SECRET': JSON.stringify(
      'test-secret-for-vitest-define'
    ),
    'process.env.NEXTAUTH_URL': JSON.stringify('http://localhost:3000'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
