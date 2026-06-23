import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/renterty";
const client = new MongoClient(mongoURI);
const db = client.db();

// Commented out to avoid gateway timeouts in serverless/Vercel environments
// await client.db("admin").command({ ping: 1 });

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:5000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  plugins: [
    bearer()
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://*.vercel.app",
    "https://*.netlify.app",
    process.env.CLIENT_URL
  ].filter(Boolean),
  secret: process.env.BETTER_AUTH_SECRET || "renterty_default_super_secret_better_auth_key_2026",
  baseURL: getBaseURL(),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "temp_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "temp_secret",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Tenant",
      },
      photo: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          let role = user.role || "Tenant";
          if (role === "Admin") {
            role = "Tenant"; // Do not allow manual admin signup
          }
          return {
            data: {
              ...user,
              role,
              photo: user.photo || user.image || "",
            },
          };
        },
      },
    },
  },
});
