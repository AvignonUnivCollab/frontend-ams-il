
import Image from "next/image";

export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm p-8 shadow-lg rounded-lg bg-opacity-30" style={{ background: "rgba(100, 65, 164, 0.3)" }}>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Inscription</h2>

        <form action="#" method="POST">
          {/* Nom et Username*/}
          <div className="mb-4 space-x-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-white">Nom</label>
              <input type="text" id="name" name="name" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 placeholder-white"placeholder="Entrez votre nom" required 
              />
            </div>
            <div className="flex-1">
              <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
              <input type="text" id="username" name="username" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 placeholder-white"placeholder="Entrez votre username" required 
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input type="email" id="email" name="email" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" placeholder="Entrez votre email" required 
            />
          </div>

          {/* Mot de passe */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-white">Mot de passe</label>
            <input type="password" id="password" name="password" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" placeholder="Entrez votre mot de passe" required />
          </div>

          {/* Confirmer le mot de passe */}
          <div className="mb-6">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-white">Confirmer le mot de passe</label>
            <input type="password" id="confirm_password" name="confirm_password" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" placeholder="Confirmez votre mot de passe" required />
          </div>

          {/* Bouton d'inscription */}
          <button type="submit" className="w-full font-bold text-black p-3 rounded-md focus:outline-none focus:ring-2" style={{ backgroundColor: "#F6DC43" }}>
            S'inscrire
          </button>
        </form>

        {/* Lien de connexion */}
        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-blue-500 hover:underline">Vous avez déjà un compte ? Connectez-vous</a>
        </div>
      </div>
    </div>
  );
}
