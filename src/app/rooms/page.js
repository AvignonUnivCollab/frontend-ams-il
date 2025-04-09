"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import { fetchData } from "../../../services/api";
import Empty from "../components/empty"; // Import the Empty component

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const result = await fetchData("rooms");
      if (result) {
        setRooms(result);
        setFilteredRooms(result); // Set initial filtered rooms as rooms
      }
      setLoading(false); // Set loading to false after data is fetched
    };

    fetchRooms();
  }, []);

  const handleSearch = () => {
    const filtered = rooms.filter((room) =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.id.toString().includes(search)
    );
    setFilteredRooms(filtered); // Update filteredRooms after search
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Rooms</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Room Name/ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="ml-4 p-2 bg-yellow-500 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* If loading or no rooms are available */}
      {loading ? (
        Array(6).fill().map((_, index) => (
          <div key={index} className="bg-purple-600 p-4 rounded-lg shadow-lg flex flex-col justify-between">
            <div className="bg-gray-200 h-48 mb-4 shimmer-effect"></div>
            <div className="h-6 bg-gray-300 rounded mb-2 shimmer-effect"></div>
            <div className="h-4 bg-gray-300 rounded mb-4 shimmer-effect"></div>
            <div className="h-8 bg-gray-300 rounded shimmer-effect"></div>
          </div>
        ))
      ) : filteredRooms.length === 0 ? (
        <Empty message="No rooms found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-purple-600 p-4 rounded-lg shadow-lg flex flex-col justify-between"
            >
              <div className="bg-gray-200 h-48 mb-4">
                <Image
                  src={room.thumbnail ? `/storage/${room.thumbnail}` : "/images/placeholder.jpg"}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-white mb-4">{room.description || "No description available."}</p>
              <button
                className="bg-yellow-500 text-black p-2 rounded-lg w-full hover:bg-yellow-600"
                onClick={() => {}}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scoped CSS for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer-effect {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
