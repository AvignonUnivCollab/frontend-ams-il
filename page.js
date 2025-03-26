import Image from "next/image";
export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-custom">
      {/* Texte "Welcome" et "WESEE" divisés */}
      <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
        <span className="text-white text-3xl font-semibold">Welcome to</span>
        <br />
        <span className="text-yellow-500 text-3xl font-semibold"><strong>WESEE</strong></span>
      </div>

      {/* Texte "Watch videos with your friends" au-dessus du bouton "Join Room" */}
      <div className="text-center text-white text-4xl font-bold mt-4">
        Watch videos with your friends
      </div>

      {/* Bouton "Join Room" centré */}
      <button className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg text-lg mt-4">
        Join Room
      </button>

      {/* Autres boutons en dessous */}
      <div className="flex flex-row space-x-4 mt-4">
        <button className="bg-gray-700 text-white py-2 px-4 rounded">Create Room</button>
        <button className="bg-gray-700 text-white py-2 px-4 rounded">Share Link</button>
        <button className="bg-gray-700 text-white py-2 px-4 rounded">Watch With Friends</button>
      </div>
    </div>
  );
}
