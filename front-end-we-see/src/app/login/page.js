import Image from "next/image";

export default function Login() {
  return (
    <div class="flex justify-center items-center min-h-screen">
      <div class="w-full max-w-sm p-8 shadow-lg rounded-lg bg-opacity-30" style={{background:"rgba(100, 65, 164, 0.3)"}}>
        <h2 class="text-2xl font-semibold text-center text-white mb-6">Connexion</h2>
    
        <form action="#" method="POST">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-white">Email</label>
            <input type="email" id="email" name="email" class="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white " placeholder="Entrez votre email" required />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-white">Mot de passe</label>
            <input type="password" id="password" name="password" class="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 placeholder-white" placeholder="Entrez votre mot de passe" required/>
         </div>

         <button type="submit" class="w-full font-bold text-black p-3 rounded-md focus:outline-none focus:ring-2" style={{backgroundColor:"#F6DC43"}}>Se connecter</button>
        </form>

        <div class="mt-4 text-center">
          <a href="#" class="text-sm text-blue-500 hover:underline">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
}