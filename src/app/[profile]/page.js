"use client";  
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://192.168.2.34:8000/api/me", { withCredentials: true });
        setUser(response.data);  // Les informations de l'utilisateur récupérées depuis l'API
      } catch (error) {
        setError("Erreur lors de la récupération des données utilisateur.");
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 shadow-lg rounded-lg bg-opacity-30" style={{ background: "rgba(100, 65, 164, 0.3)" }}>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {user ? (
          <div>
            <h2 className="text-2xl font-semibold text-center text-white mb-6">Profil de {user.name}</h2>
            <div className="text-white">
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Nom :</strong> {user.name}</p>
              <p><strong>Username :</strong> {user.username}</p>
            </div>
            <div className="mt-4 text-center">
              <Link href="/logout" className="text-sm text-blue-500 hover:underline">Se déconnecter</Link>
            </div>
          </div>
        ) : (
          <div className="text-white">Chargement des informations de l&apos;utilisateur...</div>
        )}
      </div>
    </div>
  );
}
