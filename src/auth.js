
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { dbConnect } from "@/lib/dbConnect"
import User from "@/models/User"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [

        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),

        // Credentials Provider what does mean 
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            // authorize: async (credentials) => {
            //     return null
            // },

            authorize: async (credentials) => {
                try {
                    const email = credentials?.email?.toString().trim().toLowerCase()
                    const password = credentials?.password?.toString()

                    if (!email || !password) {
                        return null
                    }

                    // 1. Connect to MongoDB
                    await dbConnect()

                    // 2. Find user by email
                    const user = await User.findOne({ email }).select("+password")

                    // 3. If no User found, return null 
                    if (!user) {
                        console.log("User not found:", credentials.email)
                        return null
                    }

                    // Use matchPassword method from User model
                    const isMatch = await user.matchPassword(password)

                    // 4. If password doesn't match, return null
                    if (!isMatch) {
                        console.log("Password mismatch for user:", credentials.email)
                        return null
                    }

                    // 5. Return user object
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.avatar,
                    }
                } catch (error) {
                    console.error("Auth error:", error.message)
                    // If MongoDB is not available, return null gracefully
                    return null
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },
})
