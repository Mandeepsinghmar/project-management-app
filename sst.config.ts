///  <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'project-management-app',
      home: 'aws',
      removal: input.stage === 'production' ? 'retain' : 'remove',
      providers: {
        aws: {
          region: 'us-east-1',
        },
      },
    };
  },
  async run() {
    const site = new sst.aws.Nextjs('manox', {
      path: '.',
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? '',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      },
      warm: $app.stage === 'prod' ? 5 : 1,
      // Optional: Configure a custom domain
      // domain: {
      //   name: "my-app.com",
      //   dns: sst.aws.dns({ override: true }),
      // },
    });
    return {
      SiteUrl: site.url,
      // CustomDomainUrl: site.domain?.name, // If custom domain is configured
    };
  },
});
