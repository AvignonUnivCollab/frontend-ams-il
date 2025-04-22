"use client";  

import { useState } from "react";
import axios from "axios";

export default function RoomPage() {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");  // State for video URL
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newRoomName);
    formData.append("description", newRoomDescription);
    formData.append("videoUrl", videoUrl);  // Append video URL

    setLoading(true);  // Start loading

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",  // Important for file uploads
        },
      });

      // Handle the response after room is created
      console.log("Room created:", response.data);
      setNewRoomName("");  // Reset input fields
      setNewRoomDescription("");
      setVideoUrl("");  // Reset video URL field
      setLoading(false);  // End loading
    } catch (error) {
      console.error("Error creating room:", error);
      setLoading(false);  // End loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full sm:w-96">
        <h1 className="text-2xl font-bold text-center text-purple-600 mb-6">Create a New Room</h1>

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Name</label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newRoomDescription}
              onChange={(e) => setNewRoomDescription(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Video URL (YouTube, etc.)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg text-lg mt-4 hover:bg-yellow-400 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
