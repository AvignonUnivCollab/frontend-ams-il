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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") { 
      const token = localStorage.getItem("token");
      if(token) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", true);
      }

      if(!token) {
        localStorage.setItem("isAuthenticated", false);
      }

    }
    
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundImage: "url('/image/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw",
        }}
      >
        <nav className="text-white p-4" style={{ backgroundColor: "#6441A4" }}>
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">WeSee</Link>

            <div className="hidden md:flex space-x-6">
              {!isAuthenticated ? (
                <>
                  <Link href="/register" className="hover:text-gray-300">Crée Compte</Link>
                  <Link href="/login" className="hover:text-gray-300">Se connecter</Link>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">Bienvenu 👋</span>
                  <button
                    onClick={handleLogout}
                    className="hover:text-gray-300"
                  >
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
