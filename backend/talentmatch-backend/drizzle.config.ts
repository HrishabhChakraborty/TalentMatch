import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5432/talentmatch?sslmode=disable',
  },
});
