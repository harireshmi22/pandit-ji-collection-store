// src/auth.config.js
export const authConfig = {
    trustHost: true, // Required for Netlify / serverless platforms
    pages: {
        signIn: "/login",
        error: '/login',
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.picture = user.image
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session }
            }
            return token
        },
        
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.image = token.picture
            }
            return session
        }
    },
    providers: [], // Providers are added in auth.js
}
