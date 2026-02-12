import { z } from 'zod';

const envSchema = z.object({
    VITE_API_URL: z.string().url(),
    VITE_APP_NAME: z.string().default('CMMS'),
    VITE_ENABLE_MOCK: z.string().default('false').transform(val => val === 'true'),
});

const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK,
};

const parsed = envSchema.safeParse(envVars);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}

export const env = {
    API_URL: parsed.data.VITE_API_URL,
    APP_NAME: parsed.data.VITE_APP_NAME,
    ENABLE_MOCK: parsed.data.VITE_ENABLE_MOCK,
};
