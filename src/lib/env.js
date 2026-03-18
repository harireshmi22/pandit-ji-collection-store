<<<<<<< HEAD
  // Environment variable validation
  const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  const optionalEnvVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  export function validateEnv() {
    const missing = requiredEnvVars.filter((env) => !process.env[env]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }

    return {
      mongodb: process.env.MONGODB_URI,
      nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL,
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    };
  }

  // Get environment variables with fallbacks
  export function getEnv() {
    return {
      nodeEnv: process.env.NODE_ENV || "development",
      mongodb: process.env.MONGODB_URI,
      nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    };
  }
=======
  // Environment variable validation
  const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  const optionalEnvVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  export function validateEnv() {
    const missing = requiredEnvVars.filter((env) => !process.env[env]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }

    return {
      mongodb: process.env.MONGODB_URI,
      nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL,
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    };
  }

  // Get environment variables with fallbacks
  export function getEnv() {
    return {
      nodeEnv: process.env.NODE_ENV || "development",
      mongodb: process.env.MONGODB_URI,
      nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
    };
  }
>>>>>>> 01ca697 (files added with fixed bugs)
