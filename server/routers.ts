import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  patterns: router({
    list: publicProcedure.query(async () => {
      const { getAllPatterns } = await import("./db");
      return getAllPatterns(true);
    }),
    featured: publicProcedure.query(async () => {
      const { getFeaturedPatterns } = await import("./db");
      return getFeaturedPatterns();
    }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getPatternById } = await import("./db");
      return getPatternById(input);
    }),
    getBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
      const { getPatternBySlug } = await import("./db");
      return getPatternBySlug(input);
    }),
  }),

  admin: router({
    patterns: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { getAllPatterns } = await import("./db");
        return getAllPatterns(false);
      }),
      create: protectedProcedure
        .input(
          z.object({
            title: z.string(),
            slug: z.string(),
            description: z.string(),
            price: z.number(),
            difficulty: z.enum(["beginner", "intermediate", "advanced"]),
            imageUrl: z.string(),
            pdfUrl: z.string(),
            pdfFileKey: z.string(),
            finishedSize: z.string().optional(),
            categoryId: z.number().optional(),
            featured: z.number().optional(),
            active: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { createPattern } = await import("./db");
          return createPattern(input);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
            price: z.number().optional(),
            difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
            imageUrl: z.string().optional(),
            pdfUrl: z.string().optional(),
            pdfFileKey: z.string().optional(),
            finishedSize: z.string().optional(),
            categoryId: z.number().optional(),
            featured: z.number().optional(),
            active: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          const { updatePattern } = await import("./db");
          return updatePattern(id, data);
        }),
      delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { deletePattern } = await import("./db");
        return deletePattern(input);
      }),
    }),
    categories: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { getAllCategories } = await import("./db");
        return getAllCategories();
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
          const { createCategory } = await import("./db");
          return createCategory(input);
        }),
    }),
  }),

  checkout: router({
    createSession: protectedProcedure
      .input(
        z.object({
          patternId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getPatternById } = await import("./db");
        const pattern = await getPatternById(input.patternId);
        
        if (!pattern) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Pattern not found" });
        }

        const { createCheckoutSession } = await import("./stripe");
        const session = await createCheckoutSession({
          patternId: pattern.id,
          patternTitle: pattern.title,
          price: pattern.price,
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "",
          origin: ctx.req.headers.origin || "http://localhost:3000",
        });

        return { url: session.url };
      }),
  }),

  purchases: router({
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPurchases } = await import("./db");
      return getUserPurchases(ctx.user.id);
    }),
    hasPurchased: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        const { hasUserPurchasedPattern } = await import("./db");
        return hasUserPurchasedPattern(ctx.user.id, input);
      }),
  }),

  chat: router({
    sendMessage: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { saveChatMessage } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        const { getChatHistory } = await import("./db");

        // Save user message
        await saveChatMessage({
          userId: ctx.user?.id,
          sessionId: input.sessionId,
          role: "user",
          content: input.message,
        });

        // Get chat history
        const history = await getChatHistory(input.sessionId, 20);
        const messages = history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Call LLM with quilting context
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a knowledgeable and friendly quilting expert assistant. You help customers with quilting questions, pattern recommendations, techniques, fabric choices, and general quilting advice. Be warm, encouraging, and specific in your responses. If asked about patterns on this site, you can recommend them based on difficulty level and style.",
            },
            ...messages,
            { role: "user", content: input.message },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof rawContent === "string" ? rawContent : "I'm sorry, I couldn't generate a response.";

        // Save assistant message
        await saveChatMessage({
          userId: ctx.user?.id,
          sessionId: input.sessionId,
          role: "assistant",
          content: assistantMessage,
        });

        return { message: assistantMessage };
      }),
    getHistory: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { getChatHistory } = await import("./db");
        return getChatHistory(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
