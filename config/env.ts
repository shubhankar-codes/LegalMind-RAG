import type { EnvironmentConfig } from '../types/index.ts';

/**
 * Validates and loads environment configuration
 * Throws an error if required environment variables are missing
 */
export const validateEnvironment = (): EnvironmentConfig => {
  const requiredEnvVars = [
    'MONGO_URI',
    'OPENROUTER_API_KEY',
    'NODE_ENV',
    'VITE_API_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
    console.error('Please check your .env file or refer to .env.example');
    process.exit(1);
  }

  const port = Number(process.env.PORT || 5000);
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Invalid PORT. Must be a number between 1 and 65535');
    process.exit(1);
  }

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    console.error('❌ Invalid NODE_ENV. Must be one of: development, production, test');
    process.exit(1);
  }

  return {
    mongoUri: process.env.MONGO_URI!,
    openRouterApiKey: process.env.OPENROUTER_API_KEY!,
    port,
    nodeEnv,
    viteApiUrl: process.env.VITE_API_URL!,
  };
};

/**
 * Logs environment configuration (safe version - doesn't expose secrets)
 */
export const logEnvironmentConfig = (config: EnvironmentConfig): void => {
  console.log('✅ Environment Configuration:');
  console.log(`   NODE_ENV: ${config.nodeEnv}`);
  console.log(`   PORT: ${config.port}`);
  console.log(`   API URL: ${config.viteApiUrl}`);
  console.log(`   MongoDB: ${config.mongoUri.replace(/:[^@]*@/, ':***@').substring(0, 50)}...`);
};
