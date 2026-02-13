// File: playwright/fixtures/test-data.ts

/**
 * Test Data
 * Replaces: cypress/fixtures/users.json
 * 
 * Migrated to TypeScript for type safety and easier access
 */

export const testData = {
    validCredentials: {
        emailId: 'test@example.com',
        password: 'password123'
    },

    adminCredentials: {
        emailId: 'admin@example.com',
        password: 'admin123'
    },

    invalidCredentials: {
        invalidEmail: {
            emailId: 'invalidUser@example.com',
            password: 'password123'
        },
        invalidPassword: {
            emailId: 'test@example.com',
            password: 'wrongpassword'
        },
        wrongEmailFormat: {
            emailId: 'testautomationresstest.com', // Missing @
            password: 'password123'
        }
    }
} as const;

// Type for credentials
export type Credentials = {
    emailId: string;
    password: string;
};
