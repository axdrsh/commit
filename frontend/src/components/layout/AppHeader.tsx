import { NavLink } from "react-router-dom";
import { Film, MessageCircle, User2, Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppState";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${
    isActive ? "bg-muted text-primary" : "hover:bg-muted/50"
  } inline-flex items-center gap-2 px-3 py-2 rounded-md transition`;

const AppHeader = () => {
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    setIsAuthenticated,
    setHasCompletedOnboarding,
  } = useAppState();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 font-semibold"
        >
          <Film className="h-5 w-5" aria-hidden="true" />
          <span>CineMatch</span>
        </NavLink>

        <nav aria-label="Primary" className="flex items-center gap-2">
          {isAuthenticated && hasCompletedOnboarding && (
            <>
              <NavLink to="/feed" className={navLinkClass} end>
                <Flame className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Feed</span>
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                <User2 className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Profile</span>
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                <MessageCircle className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Chat</span>
              </NavLink>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={navLinkClass}>
                <Button variant="outline" size="sm" asChild>
                  <span>Sign in</span>
                </Button>
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                <Button variant="default" size="sm" asChild>
                  <span>Sign up</span>
                </Button>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
