"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/services/api"; // make sure this path works based on your config

export default function MdpOubliePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await postData("/check-email", { email });

      if (response?.data?.user) {
        router.push(`/mdp-change?email=${email}`);
      } else {
        setError("Aucun utilisateur trouvé avec cet e-mail.");
      }
    } catch (err) {
      setError("Erreur lors de la vérification de l'e-mail.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 bg-opacity-60 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-sm w-full"
      >
        <h2 className="text-xl font-bold text-white mb-6">Mot de passe oublié</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}

        <input
          type="email"
          placeholder="Entrez votre e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent text-white placeholder-gray-300 mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Vérifier l'e-mail
        </button>
      </form>
    </div>
  );
}

