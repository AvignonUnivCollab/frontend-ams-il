"use client";  

import { useState } from "react";
import axios from "axios";
import {postData} from "../../../services/api"

export default function Login() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer la soumission du formulaire
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await postData("login", {username, password});
    if(result) {
        window.location.href = "/rooms";
    } else {
      setError("Erreur d'authentification : " + (error.response?.data?.message || "Une erreur est survenue"));
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm p-8 shadow-lg rounded-lg bg-opacity-30" style={{ background: "rgba(100, 65, 164, 0.3)" }}>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Connexion</h2>

        {/* Formulaire de connexion */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label 
              htmlFor="us" 
              className="block text-sm font-medium text-white">
                Username
            </label>

            <input 
              type="text" 
              id="username" 
              name="username" 
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white text-amber-50" 
              placeholder="Entrez votre username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required />
          </div>

          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-white">
                Mot de passe
                </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white text-amber-50" 
              placeholder="Entrez votre mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required />
          </div>

          <button 
             type="submit" 
             className="w-full font-bold text-black p-3 rounded-md focus:outline-none focus:ring-2" 
             style={{ backgroundColor: "#F6DC43" }} 
             disabled = {loading}
             >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="spinner-border animate-spin h-5 w-5 border-4 border-t-4 border-black-200 rounded-full"></div>
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Afficher l'erreur de connexion */}
        {error && <div className="text-red-500 mt-4">{error}</div>}

        {/* Lien vers la page de réinitialisation du mot de passe */}
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-500 hover:underline">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
}
