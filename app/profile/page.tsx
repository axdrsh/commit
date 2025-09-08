"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/app/supabase/client";

const ALL_TECH = [
  // languages
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "cpp",
  "c",
  "ruby",
  "php",
  "kotlin",
  "swift",
  "dart",
  "scala",
  "elixir",
  "clojure",
  "haskell",

  // frontend
  "react",
  "nextjs",
  "vue",
  "nuxt",
  "svelte",
  "solidjs",
  "angular",
  "lit",
  "astro",

  // styling & state
  "tailwindcss",
  "styledcomponents",
  "scss",
  "cssmodules",
  "chakraui",
  "mantine",
  "redux",
  "zustand",

  // backend frameworks
  "nodejs",
  "express",
  "fastify",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "springboot",
  "rails",
  "laravel",
  "phoenix",

  // mobile
  "reactnative",
  "flutter",
  "android",
  "ios",

  // databases & storage
  "postgres",
  "mysql",
  "mariadb",
  "sqlite",
  "mongodb",
  "redis",
  "dynamodb",
  "elasticsearch",
  "cassandra",
  "supabase",
  "firebase",

  // apis & protocols
  "graphql",
  "rest",
  "trpc",
  "grpc",
  "websockets",

  // cloud & hosting
  "aws",
  "gcp",
  "azure",
  "vercel",
  "netlify",
  "cloudflare",
  "digitalocean",
  "flyio",

  // devops & infra
  "docker",
  "kubernetes",
  "terraform",
  "pulumi",
  "ansible",
  "githubactions",
  "gitlabci",
  "circleci",

  // data & ai
  "pandas",
  "numpy",
  "scikitlearn",
  "pytorch",
  "tensorflow",
  "langchain",

  // build tools & monorepos
  "vite",
  "webpack",
  "esbuild",
  "rollup",
  "babel",
  "swc",
  "turborepo",
  "nx",

  // testing
  "jest",
  "vitest",
  "cypress",
  "playwright",
  "testinglibrary",
  "mocha",

  // streaming & queues
  "kafka",
  "rabbitmq",
  "nats",
  "bullmq",

  // observability
  "prometheus",
  "grafana",
  "opentelemetry",
  "sentry",
  "datadog",

  // orm & data tools
  "prisma",
  "drizzle",
  "typeorm",
  "sequelize",
  "knex",

  // auth & identity
  "authjs",
  "keycloak",
  "ldap",

  // serverless & containers
  "lambda",
  "cloudfunctions",
  "cloudrun",
  "podman",
];

export default function ProfilePage() {
  const supabase = createBrowserSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) {
        setStatus("Please log in.");
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username, bio, tech_stack, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setTechStack(Array.isArray(data.tech_stack) ? data.tech_stack : []);
        setAvatarUrl((data as any).avatar_url ?? null);
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const toggleTech = (t: string) => {
    setTechStack((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      setStatus("Please log in.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: username || null,
      bio: bio || null,
      tech_stack: techStack,
      avatar_url: avatarUrl || null,
    });
    if (error) setStatus(error.message);
    else setStatus("Saved");
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      setStatus("Please log in.");
      return;
    }
    try {
      setUploading(true);
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
      setStatus("photo uploaded");
    } catch (err: any) {
      setStatus(err.message || "upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 w-full">
      <h1 className="text-2xl font-semibold mb-4">your profile</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs opacity-70">no photo</span>
              )}
            </div>
            <label className="text-sm rounded px-3 py-2 border cursor-pointer">
              {uploading ? "uploading..." : "upload photo"}
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ada-lovelace"
              className="border rounded px-3 py-2 bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Loves type safety and coffee."
              className="border rounded px-3 py-2 bg-transparent min-h-28"
            />
          </label>

          <div>
            <div className="text-sm opacity-80 mb-2">tech stack</div>
            <div className="flex flex-wrap gap-2">
              {ALL_TECH.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTech(t)}
                  className={`px-3 py-1 rounded border text-sm ${
                    techStack.includes(t)
                      ? "bg-foreground text-background"
                      : "hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button className="rounded px-3 py-2 border font-medium w-fit">
            save
          </button>
          {status && <p className="text-sm opacity-80">{status}</p>}
        </form>
      )}
    </div>
  );
}
