import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mockPrisma, isMockingDatabase } from "@/lib/mock-db";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword as firebaseSignIn } from "firebase/auth";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

// Use mock database in development when real database is unavailable
function getDb() {
  return isMockingDatabase() ? mockPrisma : prisma;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firebaseUid: { label: "Firebase UID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const db = getDb();
          console.log(`[NextAuth] Looking for agent with email: ${credentials.email}`);
          console.log(`[NextAuth] Using ${isMockingDatabase() ? "MOCK" : "REAL"} database`);
          
          let agent = await db.agent.findUnique({
            where: { email: credentials.email },
          });

          console.log(`[NextAuth] Agent lookup result:`, agent);

          // If agent doesn't exist, try Firebase authentication
          if (!agent) {
            console.log(`[NextAuth] Agent not found in DB, trying Firebase auth...`);
            
            try {
              const firebaseUserCredential = await firebaseSignIn(
                firebaseAuth,
                credentials.email,
                credentials.password
              );
              
              const firebaseUser = firebaseUserCredential.user;
              console.log(`[NextAuth] Firebase auth successful for ${credentials.email}`);
              
              // Agent doesn't exist but Firebase auth worked - create agent
              const baseSlug = (firebaseUser.displayName || credentials.email.split("@")[0])
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

              const timestamp = Date.now().toString().slice(-5);
              const slug = `${baseSlug}-${timestamp}`;

              agent = await db.agent.create({
                data: {
                  email: firebaseUser.email || credentials.email,
                  businessName: firebaseUser.displayName || credentials.email,
                  slug,
                  firebaseUid: firebaseUser.uid,
                  status: "PENDING",
                  commissionRate: 0.3,
                  phoneNumber: "",
                  bankName: "",
                  accountNumber: "",
                  accountName: "",
                },
              });

              console.log(`[NextAuth] Created agent from Firebase: ${agent.id}`);
            } catch (firebaseError: any) {
              console.error(`[NextAuth] Firebase auth failed:`, firebaseError.message);
              throw new Error("Invalid credentials - Agent not found");
            }
          } else if (credentials.password) {
            // Agent exists, validate password if it's set
            if (agent.password) {
              const isPasswordValid = await compare(
                credentials.password,
                agent.password
              );

              if (!isPasswordValid) {
                console.log(`[NextAuth] Password invalid for ${credentials.email}`);
                throw new Error("Invalid password");
              }
            } else {
              // No password set - try Firebase auth as fallback
              console.log(`[NextAuth] No password set, trying Firebase auth...`);
              
              try {
                const firebaseUserCredential = await firebaseSignIn(
                  firebaseAuth,
                  credentials.email,
                  credentials.password
                );
                
                const firebaseUser = firebaseUserCredential.user;
                console.log(`[NextAuth] Firebase auth successful (fallback) for ${credentials.email}`);
                
                // Update agent with Firebase UID if not already set
                if (!agent.firebaseUid) {
                  agent = await db.agent.update({
                    where: { id: agent.id },
                    data: { firebaseUid: firebaseUser.uid },
                  });
                }
              } catch (firebaseError: any) {
                console.error(`[NextAuth] Firebase auth failed:`, firebaseError.message);
                throw new Error("Invalid credentials");
              }
            }
          }

          console.log(`[NextAuth] Authorization successful for ${credentials.email}`);
          
          return {
            id: agent.id,
            email: agent.email,
            name: agent.businessName,
            status: agent.status,
          };
        } catch (error: any) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.agentId = user.id;
        token.email = user.email;
        
        try {
          const db = getDb();
          const agent = await db.agent.findUnique({
            where: { id: user.id },
          });
          token.status = agent?.status || "pending";
          token.slug = agent?.slug || "";
        } catch (error) {
          console.error("JWT callback database error:", error);
          // Use default values if database is unavailable
          token.status = "pending";
          token.slug = "";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.agentId as string;
        session.user.status = token.status as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
