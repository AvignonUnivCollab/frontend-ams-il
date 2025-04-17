"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postData } from "../../../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const result = await postData(
      "register",
      { name, username, email, password },
      { withCredentials: true }
    );

    if (result) {
      setMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      localStorage.setItem("token", result.data.token);
      router.push("/login");
    } 

    if (!result) {
      const errorMessages = result.error.response?.data?.errors || {};
      setMessage(Object.values(errorMessages).join(", ") || "Les données envoyées sont incorrectes.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm p-8 shadow-lg rounded-lg bg-opacity-30" style={{ background: "rgba(100, 65, 164, 0.3)" }}>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Inscription</h2>

        <form onSubmit={handleRegister}>
          {/* Nom et Username */}
          <div className="mb-4 space-x-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-white">Nom</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 placeholder-white" 
                placeholder="Entrez votre nom" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex-1">
              <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 placeholder-white" 
                placeholder="Entrez votre username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white"  
              placeholder="Entrez votre email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Mot de passe */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-white">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" 
              placeholder="Entrez votre mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* Confirmer le mot de passe */}
          <div className="mb-6">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-white">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="confirm_password" 
              name="confirm_password" 
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" 
              placeholder="Confirmez votre mot de passe" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold text-black bg-yellow-300 p-3 rounded-md hover:bg-yellow-400 transition-all"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        {/* Messages d'erreur ou de succès */}
        {message && <div className="text-green-500 mt-4">{message}</div>}

        {/* Lien vers la page de connexion */}
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:underline">Vous avez déjà un compte ? Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
}
