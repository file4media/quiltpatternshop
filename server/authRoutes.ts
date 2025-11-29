import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { loginUser, registerUser } from "./auth";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await registerUser(input.email, input.password, input.name);
        const { token } = await loginUser(input.email, input.password);
        
        // Set cookie
        ctx.res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });
        
        return { success: true, user };
      } catch (error: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Registration failed',
        });
      }
    }),
  
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await loginUser(input.email, input.password);
        
        // Set cookie
        ctx.res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });
        
        return { success: true, user };
      } catch (error: any) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Login failed',
        });
      }
    }),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { success: true };
  }),
});
