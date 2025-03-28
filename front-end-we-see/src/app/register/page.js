<<<<<<< HEAD
"use client"; 

import { useState } from "react";
import axios from "axios";
=======

import Image from "next/image";
>>>>>>> 99c93b630dab8b6c1eeb049cf1d95cc5518ab863

export default function Register() {
  const [name, setName] = useState(""); 
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");   
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState("");         
  const [successMessage, setSuccessMessage] = useState(""); 

  // Function to handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");  // Clear previous error message

    try {
      const response = await axios.post(
        "http://192.168.2.34:8000/api/register", 
        { name, username, email, password },
        { withCredentials: true }
      );

      // If registration is successful
      setSuccessMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setError(""); // Clear error message

      // Store JWT token in localStorage or cookies
      localStorage.setItem("auth_token", response.data.token); // or use cookies if preferred

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "/login"; 
      }, 2000);
    } catch (error) {
      // Handle API error responses
      if (error.response?.status === 422) {
        const errorMessages = error.response?.data?.errors || {};
        setError(Object.values(errorMessages).join(", ") || "Les données envoyées sont incorrectes.");
      } else {
        setError(error.response?.data?.message || "Une erreur est survenue");
      }
      setSuccessMessage(""); // Clear success message
    }
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
            className="w-full font-bold text-black p-3 rounded-md focus:outline-none focus:ring-2" 
            style={{ backgroundColor: "#F6DC43" }} 
          >
            S'inscrire
          </button>
        </form>

        {/* Messages d'erreur ou de succès */}
        {error && <div className="text-red-500 mt-4">{error}</div>}
        {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}

        {/* Lien vers la page de connexion */}
        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-blue-500 hover:underline">Vous avez déjà un compte ? Connectez-vous</a>
        </div>
      </div>
    </div>
  );
}
