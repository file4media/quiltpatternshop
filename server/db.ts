import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUser(email: string, password: string, name?: string, role: "user" | "admin" = "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    email,
    password,
    name: name || null,
    role,
  });
  return result;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignIn(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

import { categories, patterns, purchases, chatMessages, InsertPattern, InsertPurchase, InsertCategory, InsertChatMessage, Pattern } from "../drizzle/schema";
import { desc, and, eq as eqOp } from "drizzle-orm";

// Categories
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eqOp(categories.id, id)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(eqOp(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eqOp(categories.id, id));
}

// Patterns
export async function getAllPatterns(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const query = activeOnly 
    ? db.select().from(patterns).where(eqOp(patterns.active, 1)).orderBy(desc(patterns.createdAt))
    : db.select().from(patterns).orderBy(desc(patterns.createdAt));
  return query;
}

export async function getFeaturedPatterns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patterns)
    .where(and(eqOp(patterns.featured, 1), eqOp(patterns.active, 1)))
    .orderBy(desc(patterns.createdAt))
    .limit(6);
}

export async function getPatternById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patterns).where(eqOp(patterns.id, id)).limit(1);
  return result[0];
}

export async function getPatternBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patterns).where(eqOp(patterns.slug, slug)).limit(1);
  return result[0];
}

export async function createPattern(data: InsertPattern) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patterns).values(data);
  return result;
}

export async function updatePattern(id: number, data: Partial<InsertPattern>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patterns).set(data).where(eqOp(patterns.id, id));
}

export async function deletePattern(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(patterns).where(eqOp(patterns.id, id));
}

// Purchases
export async function createPurchase(data: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchases).values(data);
  return result;
}

export async function getPurchaseBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchases).where(eqOp(purchases.stripeSessionId, sessionId)).limit(1);
  return result[0];
}

export async function updatePurchaseStatus(sessionId: string, status: "pending" | "completed" | "failed", paymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (paymentIntentId) {
    updateData.stripePaymentIntentId = paymentIntentId;
  }
  await db.update(purchases).set(updateData).where(eqOp(purchases.stripeSessionId, sessionId));
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      purchase: purchases,
      pattern: patterns,
    })
    .from(purchases)
    .leftJoin(patterns, eqOp(purchases.patternId, patterns.id))
    .where(and(eqOp(purchases.userId, userId), eqOp(purchases.status, "completed")))
    .orderBy(desc(purchases.purchasedAt));
  return result;
}

export async function hasUserPurchasedPattern(userId: number, patternId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(purchases)
    .where(and(
      eqOp(purchases.userId, userId),
      eqOp(purchases.patternId, patternId),
      eqOp(purchases.status, "completed")
    ))
    .limit(1);
  return result.length > 0;
}

// Chat Messages
export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(chatMessages).values(data);
}

export async function getChatHistory(sessionId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eqOp(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}
