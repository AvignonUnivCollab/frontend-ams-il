
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm p-8 shadow-lg rounded-lg bg-opacity-30" style={{background:"rgba(100, 65, 164, 0.3)"}}>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Connexion</h2>
    
        <form action="#" method="POST">
          <div className="mb-4">
            <label for="email" className="block text-sm font-medium text-white">Email</label>
            <input type="email" id="email" name="email" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white " placeholder="Entrez votre email" required />
          </div>

          <div className="mb-6">
            <label for="password" className="block text-sm font-medium text-white">Mot de passe</label>
            <input type="password" id="password" name="password" className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" placeholder="Entrez votre mot de passe" required/>
         </div>

         <button type="submit" className="w-full font-bold text-black p-3 rounded-md focus:outline-none focus:ring-2" style={{backgroundColor:"#F6DC43"}}>Se connecter</button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-blue-500 hover:underline">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
}
