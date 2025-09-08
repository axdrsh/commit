"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

export default function Nav() {
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 border-b border-black/[.08] dark:border-white/[.145]">
      <div className="flex items-center gap-4">
        <Link className="font-semibold" href="/">
          commit
        </Link>
        <Link href="/discover" className="text-sm hover:underline">
          discover
        </Link>
        <Link href="/profile" className="text-sm hover:underline">
          profile
        </Link>
        <Link href="/matches" className="text-sm hover:underline">
          matches
        </Link>
        <Link href="/chat" className="text-sm hover:underline">
          chat
        </Link>
      </div>
      <div>
        {loading ? null : user ? (
          <button
            onClick={handleLogout}
            className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
          >
            logout
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm rounded px-3 py-1 border hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
          >
            login
          </Link>
        )}
      </div>
    </nav>
  );
}
