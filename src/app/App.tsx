import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/pages/Login";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { Dashboard } from "./components/pages/Dashboard";
import { Products } from "./components/pages/Products";
import { ContentEditor } from "./components/pages/ContentEditor";
import { Messages } from "./components/pages/Messages";
import { Email } from "./components/pages/Email";
import { Categories } from "./components/pages/Categories";
import { BlogManager } from "./components/pages/BlogManager";
import { Analytics } from "./components/pages/Analytics";
import { NotFound } from "./components/pages/NotFound";
import { Toaster } from "sonner";

function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--ws-bg)" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
          <p style={{ color: "var(--ws-text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--ws-bg)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/email" element={<Email />} />
            <Route path="/blog" element={<BlogManager />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/content/:pageName" element={<ContentEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ScrollToTopButton />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </>
  );
}
