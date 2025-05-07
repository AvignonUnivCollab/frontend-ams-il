"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: "",
    user: null
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      const userJson = localStorage.getItem("user");
      
      let user = null;
      try {
        if (userJson && userJson.startsWith("{") && userJson.endsWith("}")) {
          user = JSON.parse(userJson);
        }
      } catch (e) {
        console.error("Erreur de parsing user:", e);
      }
  
      setAuthState({
        isAuthenticated: !!token,
        username: username || "",
        user
      });
    };
  
    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    setAuthState({ isAuthenticated: false, username: "", user: null });
    router.push("/login");
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundImage: "url('/image/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw", }}>
        <nav className="text-white p-4" style={{ backgroundColor: "#6441A4" }}>
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">WeSee</Link>

            <div className="hidden md:flex space-x-6">
              {!authState.isAuthenticated ? (
                <>
                  <Link href="/register" className="hover:text-gray-300">Créer Compte</Link>
                  <Link href="/login" className="hover:text-gray-300">Se connecter</Link>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    Bienvenu 👋 {authState.user?.name || authState.username}
                  </span>
                  <button onClick={handleLogout} className="hover:text-gray-300">
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}