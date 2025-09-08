"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

export default function Home() {
  const supabase = createBrowserSupabaseClient();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setLoggedIn(!!data.session?.user);
    };
    check();
  }, [supabase]);

  return (
    <main className="max-w-2xl mx-auto mt-16 w-full">
      <h1 className="text-3xl font-semibold">commit</h1>
      <p className="opacity-80 mt-2">
        a dating app for programmers, matched by tech stack.
      </p>
      <div className="flex gap-3 mt-6">
        {!loggedIn && (
          <Link className="rounded px-3 py-2 border font-medium" href="/login">
            login
          </Link>
        )}
        <Link className="rounded px-3 py-2 border font-medium" href="/profile">
          edit profile
        </Link>
        <Link className="rounded px-3 py-2 border font-medium" href="/discover">
          discover
        </Link>
      </div>
    </main>
  );
}
