"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace("/discover");
      }
    };
    check();
  }, [supabase, router]);

  const handleGithub = async () => {
    try {
      setLoadingGithub(true);
      setStatus(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}` },
      });
      if (error) setStatus(error.message);
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingEmail(true);
      setStatus(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}` },
      });
      if (error) setStatus(error.message);
      else setStatus("Check your email for the magic link.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 w-full">
      <h1 className="text-2xl font-semibold mb-4">login</h1>
      <div className="flex flex-col gap-4">
        <button
          onClick={handleGithub}
          disabled={loadingGithub}
          className="rounded px-3 py-2 border font-medium disabled:opacity-60"
        >
          {loadingGithub ? "redirecting..." : "continue with github"}
        </button>

        <div className="opacity-60 text-xs text-center">or</div>

        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border rounded px-3 py-2 bg-transparent"
          />
          <button
            disabled={loadingEmail}
            className="rounded px-3 py-2 border font-medium disabled:opacity-60"
          >
            {loadingEmail ? "sending..." : "send magic link"}
          </button>
        </form>
      </div>
      {status && <p className="text-sm mt-3 opacity-80">{status}</p>}
    </div>
  );
}
