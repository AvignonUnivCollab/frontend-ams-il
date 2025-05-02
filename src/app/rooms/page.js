"use client";  

import { useEffect, useState } from "react";
import { fetchData, postData } from "../../../services/api";
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Rooms() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [leaving, setLeaving] = useState({});
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch rooms data on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const result = await fetchData("rooms"); // Fetch rooms from the backend
        if (result && result.data?.length > 0) {
          setRooms(result.data);
          setFilteredRooms(result.data);
        }
      } catch (error) {
        console.error("Error fetching rooms: ", error);
        setError("Error fetching rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Filter rooms by search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) =>
        room.id.toString().includes(searchQuery) || room.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, rooms]);

  // Join a room
  const joinRoom = async (roomId) => {
    try {
      setSending((prev) => ({ ...prev, [roomId]: true }));
      const result = await postData(`room/${roomId}/join`); // Send request to join the room
      if (result && result.data != null) {
        router.push(`/videos/${roomId}`);
      } else {
        throw new Error("Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room", error);
      setError("Failed to join room");
    } finally {
      setSending((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  // Leave a room
  const leaveRoom = async (roomId) => {
    try {
      setLeaving((prev) => ({ ...prev, [roomId]: true }));
      const result = await postData(`room/${roomId}/leave`); // Send request to leave the room
      if (result && result.data != null) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, is_joined: false, user_count: room.user_count - 1 } : room
          )
        );
      } else {
        throw new Error("Failed to leave room");
      }
    } catch (error) {
      console.error("Error leaving room", error);
      setError("Failed to leave room");
    } finally {
      setLeaving((prev) => ({ ...prev, [roomId]: false }));
    }
  };


  const viewRoom = (roomId) => { router.push(`/videos/${roomId}`); };


  return (
    <div className="container mx-auto p-4 mt-3">
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white/70 z-50">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-yellow-500 border-t-transparent"></div>
        </div>
      )}


      {!loading && filteredRooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-purple-600 p-4 rounded-lg shadow-lg flex flex-col justify-between group transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              <div className="bg-gray-200 h-48 mb-4">
                <img
                  src={room.thumbnail}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-0">{room.name}</h3>
              <p className="text-white mb-2 line-clamp-2">{room.description || "No description available."}</p>
              <i className="text-white text-sm mb-3">
                {room.video_count} videos • {room.user_count} users • {room.message_count} messages
              </i>
              
              {room.is_joined ? (
                    <div className="flex gap-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-black p-2 rounded-lg w-full"
                        onClick={() => leaveRoom(room.id)}
                      >
                        {leaving[room.id] ? "In Progress..." : "Leave"}
                      </button>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg w-full"
                        onClick={() => viewRoom(room.id)}
                      >
                        Voir
                      </button>
                    </div>
                ) : (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded-lg w-full"
                    onClick={() => joinRoom(room.id)}
                  >
                    {sending[room.id] ? "In Progress..." : "Join"}
                  </button>
                )}

            </div>
          ))}
        </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div className="text-center text-white">
          No rooms found.
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
}