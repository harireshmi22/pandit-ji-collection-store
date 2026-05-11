
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
            clientSecret: process.env.GOOGLE_CLIENT_SECRETS,
        }),

        // Credentials Provider what does mean 
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            authorize: async (credentials) => {
                try {
                    const email = credentials?.email ? String(credentials.email).trim().toLowerCase() : ''
                    const password = credentials?.password ? String(credentials.password) : ''

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
                        id: user._id ? String(user._id) : '',
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

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    await dbConnect()

                    // Check if user exists by email
                    const existingUser = await User.findOne({ email: user.email })

                    if (existingUser) {
                        // Update user with googleId if not set
                        if (!existingUser.googleId && profile?.sub) {
                            await User.findByIdAndUpdate(existingUser._id, {
                                googleId: profile.sub,
                                avatar: user.image || existingUser.avatar
                            })
                        }
                        // Return the MongoDB ObjectId
                        user.id = existingUser._id ? String(existingUser._id) : ''
                    } else {
                        // Create new user with googleId
                        const newUser = await User.create({
                            name: user.name,
                            email: user.email,
                            googleId: profile?.sub,
                            avatar: user.image,
                        })
                        user.id = newUser._id ? String(newUser._id) : ''
                    }
                } catch (error) {
                    console.error("Google sign-in error:", error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
            }
            return session
        }
    },

    session: {
        strategy: "jwt",
    },
})
