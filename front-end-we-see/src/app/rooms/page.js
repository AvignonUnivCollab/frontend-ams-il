"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [roomImage, setRoomImage] = useState(null);  

  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
          params: { search },
        });
        if (Array.isArray(response.data.data)) {
          setRooms(response.data.data);  
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, [search]);

  // Handle creating a new room
  const handleCreateRoom = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/rooms", {
        name: newRoomName,
        description: newRoomDescription,
      });

      setRooms([...rooms, response.data]); // Add the new room to the list
      setNewRoomName(""); // Reset input fields
      setNewRoomDescription("");
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRoomImage(file);  // Store the uploaded file in state
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Rooms</h1>

      {/* Search bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Room Name/ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => {}}
          className="ml-4 p-2 bg-yellow-500 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Room list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-purple-600 p-4 rounded-lg shadow-lg flex flex-col justify-between"
          >
            <div className="bg-gray-200 h-48 mb-4">
              {room.thumbnail}
              <img
                src={room.thumbnail ? `/storage/${room.thumbnail}` : "/images/placeholder.jpg"}
                alt={room.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">{room.name}</h3>
            <p className="text-white mb-4">{room.description || "No description available."}</p>
            <button
              className="bg-yellow-500 text-black p-2 rounded-lg w-full hover:bg-yellow-600"
              onClick={() => {
                // Handle room join action
                //TODO
              }}
            >
              Join
            </button>
          </div>
        ))}
      </div>

      {/* Create Room Form */}
      <div className="my-6">
        <h2 className="text-lg font-semibold">Create a New Room</h2>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-white">Room Name</label>
            <input
              type="text"
              id="roomName"
              placeholder="Enter room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label htmlFor="roomDescription" className="block text-white">Description</label>
            <textarea
              id="roomDescription"
              placeholder="Enter room description"
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full"
            />
          </div>
          <div>
            <label htmlFor="roomDescription" className="block text-white">photo</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>


          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg w-full"
          >
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
}
