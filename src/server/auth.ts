import { type GetServerSidePropsContext } from 'next';
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type User as NextAuthUserType,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '~/server/db';
import { env } from '~/env';
import { supabaseAdmin } from '~/lib/supabaseAdmin';

interface UserType extends NextAuthUserType {}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserType &
      DefaultSession['user'] & {
        id: string;
      };
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          console.error('Supabase Sign In Error:', error?.message);
          return null;
        }

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user && data.user.email) {
          user = await db.user.create({
            data: {
              id: data.user.id,
              email: data.user.email,
              name:
                data.user.user_metadata?.name || data.user.email?.split('@')[0],
              image: data.user.user_metadata?.avatar_url,
              emailVerified: data.user.email_confirmed_at
                ? new Date(data.user.email_confirmed_at)
                : null,
            },
          });
        } else if (user && data.user) {
          user = await db.user.update({
            where: { email: credentials.email },
            data: {
              name: data.user.user_metadata?.name || user.name,
              image: data.user.user_metadata?.avatar_url || user.image,
              emailVerified: data.user.email_confirmed_at
                ? new Date(data.user.email_confirmed_at)
                : user.emailVerified,
            },
          });
        }

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  secret: env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
