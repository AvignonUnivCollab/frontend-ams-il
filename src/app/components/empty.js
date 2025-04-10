// components/Empty.js

export default function Empty({ message}) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-4">{message}</h2>
        </div>
      </div>
    );
  }
  