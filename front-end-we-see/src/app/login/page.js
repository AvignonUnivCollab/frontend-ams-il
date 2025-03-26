export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Se connecter</h1>

        {/* Login*/}
        <form className="space-y-4">
          
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

          {/* Submit*/}
          <div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
