<<<<<<< HEAD
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { dbConnect } from "@/lib/dbConnect"
import User from "@/models/User"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [

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

                    // 1. Connect to MongoDB
                    await dbConnect()

                    // 2. Find user by email
                    const user = await User.findOne({ email: credentials.email }).select("+password")

                    // 3. If no user found, return null 
                    if (!user) {
                        console.log("User not found:", credentials.email)
                        return null
                    }

                    // Use matchPassword method from User model
                    const isMatch = await user.matchPassword(credentials.password)

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
=======
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { dbConnect } from "@/lib/dbConnect"
import User from "@/models/User"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [

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

                    // 1. Connect to MongoDB
                    await dbConnect()

                    // 2. Find user by email
                    const user = await User.findOne({ email: credentials.email }).select("+password")

                    // 3. If no user found, return null 
                    if (!user) {
                        console.log("User not found:", credentials.email)
                        return null
                    }

                    // Use matchPassword method from User model
                    const isMatch = await user.matchPassword(credentials.password)

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
>>>>>>> 01ca697 (files added with fixed bugs)
