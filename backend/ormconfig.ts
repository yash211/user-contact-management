import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load environment variables

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'user_contacts',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
