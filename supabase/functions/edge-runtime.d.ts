/** Minimal Deno globals for Supabase Edge Functions (IDE + tsc only). */
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
};
