import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <SEO
        title="CineMatch – Film‑first dating"
        description="Meet people through movies. Build your cinephile profile, get taste‑based matches, and chat with smart icebreakers."
      />
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Meet through movies
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pick your Top 4 films, get a taste match score, and start better
          conversations.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </header>
    </main>
  );
};

export default Index;
