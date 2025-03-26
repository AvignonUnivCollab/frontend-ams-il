export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Créer un Compte</h1>

        {/* creer compte Form */}
        <form className="space-y-4">
         
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none text-black"
              placeholder="Enter your full name"
            />
          </div>

      
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none text-black"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none text-black"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-700">Confirmer Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:outline-none text-black"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              Créer un Compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
