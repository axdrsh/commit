import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { HelmetProvider } from "react-helmet-async";
import AppHeader from "@/components/layout/AppHeader";
import { AppStateProvider, useAppState } from "@/context/AppState";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Feed from "@/pages/Feed";
import Chat from "@/pages/Chat";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Protected Route component that checks authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppState();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Route that redirects authenticated users away from auth pages
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, hasCompletedOnboarding } = useAppState();

  if (isAuthenticated) {
    return hasCompletedOnboarding ? (
      <Navigate to="/feed" replace />
    ) : (
      <Navigate to="/onboarding" replace />
    );
  }

  return <>{children}</>;
};

// App routing component that uses the auth state
const AppRoutes = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAppState();

  return (
    <>
      <AppHeader />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        {/* Landing page - redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              hasCompletedOnboarding ? (
                <Navigate to="/feed" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Index />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
