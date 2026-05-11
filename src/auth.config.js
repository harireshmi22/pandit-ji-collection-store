// src/auth.config.js
export const authConfig = {
    trustHost: true, // Required for Netlify / serverless platforms
    pages: {
        signIn: "/login",
        error: '/login',
    },
    providers: [], // Providers are added in auth.js
}