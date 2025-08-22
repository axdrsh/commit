import React, { createContext, useContext, useMemo, useState } from "react";

export type Movie = {
  id: string;
  title: string;
  year?: number;
  poster?: string;
};

export type Profile = {
  name: string;
  bio?: string;
  photoDataUrl?: string;
  top4: Movie[];
};

export type MatchProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  photoUrl?: string;
  matchScore: number; // 0-100
  sharedReasons: string[];
  top4: Movie[];
};

export type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
};

export type Conversation = {
  matchId: string;
  messages: Message[];
};

interface AppState {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  updateTop4: (movies: Movie[]) => void;
  matches: MatchProfile[];
  setMatches: (m: MatchProfile[]) => void;
  conversations: Record<string, Conversation>; // key: matchId
  sendMessage: (matchId: string, text: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [matches, setMatches] = useState<MatchProfile[]>([
    {
      id: "m1",
      name: "Sarah",
      age: 28,
      location: "NYC",
      matchScore: 88,
      sharedReasons: [
        "You both love Studio Ghibli",
        "Both rated Parasite ★★★★★",
      ],
      photoUrl: "/placeholder.svg",
      top4: [
        {
          id: "tt4154796",
          title: "Avengers: Endgame",
          year: 2019,
          poster: "/placeholder.svg",
        },
        {
          id: "tt6751668",
          title: "Parasite",
          year: 2019,
          poster: "/placeholder.svg",
        },
        {
          id: "tt1375666",
          title: "Inception",
          year: 2010,
          poster: "/placeholder.svg",
        },
        {
          id: "tt0119698",
          title: "Princess Mononoke",
          year: 1997,
          poster: "/placeholder.svg",
        },
      ],
    },
  ]);

  const [conversations, setConversations] = useState<
    Record<string, Conversation>
  >({
    m1: {
      matchId: "m1",
      messages: [
        {
          id: "c1",
          fromMe: false,
          text: "Hey! Big Ghibli fan here ✨",
          timestamp: Date.now() - 1000 * 60 * 60,
        },
        {
          id: "c2",
          fromMe: true,
          text: "Same! What's your favorite?",
          timestamp: Date.now() - 1000 * 60 * 45,
        },
      ],
    },
  });

  const setProfile = (p: Profile) => {
    setProfileState(p);
    setHasCompletedOnboarding(true);
  };
  const updateTop4 = (movies: Movie[]) =>
    setProfileState((prev) =>
      prev ? { ...prev, top4: movies } : { name: "", top4: movies }
    );

  const sendMessage = (matchId: string, text: string) => {
    setConversations((prev) => {
      const convo = prev[matchId] || { matchId, messages: [] };
      return {
        ...prev,
        [matchId]: {
          ...convo,
          messages: [
            ...convo.messages,
            {
              id: Math.random().toString(36).slice(2),
              fromMe: true,
              text,
              timestamp: Date.now(),
            },
          ],
        },
      };
    });
  };

  const value = useMemo<AppState>(
    () => ({
      profile,
      setProfile,
      updateTop4,
      matches,
      setMatches,
      conversations,
      sendMessage,
      isAuthenticated,
      setIsAuthenticated,
      hasCompletedOnboarding,
      setHasCompletedOnboarding,
    }),
    [profile, matches, conversations, isAuthenticated, hasCompletedOnboarding]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
