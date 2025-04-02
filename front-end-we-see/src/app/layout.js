"use client";  // This tells Next.js to treat this as a client component

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("auth_token"); // Assuming you store the token in localStorage
    if (token) {
      setIsAuthenticated(true); // User is logged in
    } else {
      setIsAuthenticated(false); // User is not logged in
    }
  }, []); // Run only once when the component mounts

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
            <Link href="/" className="text-xl font-bold">
              WeSee
            </Link>

            <div className="hidden md:flex space-x-6">
              {/* Show links if the user is not logged in */}
              {!isAuthenticated ? (
                <>
                  <Link href="/register" className="hover:text-gray-300">
                    Crée Compte
                  </Link>
                  <Link href="/login" className="hover:text-gray-300">
                    Se connecter
                  </Link>
                </>
              ) : (
                // Show user-related links if logged in
                <div className="flex space-x-6">
                  
                  <button
                    onClick={() => {
                      localStorage.removeItem("auth_token"); // Log out the user
                      setIsAuthenticated(false); // Update state
                    }}
                    className="hover:text-gray-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button className="md:hidden flex items-center px-3 py-2 border rounded text-white border-white hover:bg-white hover:text-blue-600">
              hidden
            </button>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
