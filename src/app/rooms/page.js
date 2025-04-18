"use client";  

import { useEffect, useState } from "react";
import { fetchData, postData } from "../../../services/api";
import { useRouter } from 'next/navigation';

export default function rooms() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [leaving, setLeaving] = useState({});
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const result = await fetchData("rooms");
        const user = localStorage.getItem("user");
        
        console.log(result);
        if (result && result.data?.length > 0) {
          setRooms(result.data);
          setFilteredRooms(result.data);
        }
      } catch (error) {
        console.error("Error fetching rooms: ", error);
        console.error("Erreur lors de chargement des rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const joinRoom = async (roomId) => {
    try {
      setSending((prev) => ({ ...prev, [roomId]: true }));
      const result = await postData(`room/${roomId}/join`);
      console.log(result);

      if (result && result.data != null) {
        console.log("Room join successful");
        router.push(`/videos?roomId=${roomId}`);

      } else {
        throw new Error("Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room", error);
    } finally {
      setSending((prev) => ({ ...prev, [roomId]: false }));
    }
  };


  const leaveRoom = async (roomId) => {
    try{
      setLeaving((prev) => ({ ...prev, [roomId]: true }));
      const result = await postData(`room/${roomId}/leave`);
      console.log(result);

      if(result && result.data != null) {
        console.log("Room leave successfull");

        setRooms((prevRooms) => 
          prevRooms.map((room) => 
           room.id == roomId ? {...room, is_joined : false, user_count : room.user_count -1} : room
          )
        );
      } else {
        throw new Error("Failed to leave room");
      }
    }catch(error) {
      console.error("Error joining room", error);
    } finally {
      setLeaving((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  return (
    <div className="container mx-auto p-0 mt-3">
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white/70 z-50">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-yellow-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-purple-600 p-4 rounded-lg shadow-lg flex flex-col justify-between group transform transition-all duration-300 ease-in-out hover:scale-115"
            >
              <div className="bg-gray-200 h-48 mb-4">
                <img
                  src={room.thumbnail}
                  alt={room.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="text-white text-xl font-semibold mb-0">{room.name}</h3>
              <p className="text-white mb-2 line-clamp-2">
                {room.description || "No description available."}
              </p>
              <i className="text-white text-sm mb-3">
                {room.video_count} videos • {room.user_count} utilisateurs • {room.message_count} messages{" "}
              </i>
              <button
                className={`${
                  room.is_joined ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"
                } text-black p-2 rounded-lg w-full`}
                onClick={() => (room.is_joined ? leaveRoom(room.id) : joinRoom(room.id))}
              >
                {room.is_joined
                  ? leaving[room.id]
                    ? "En cours..."
                    : "Quitter"
                  : sending[room.id]
                    ? "En cours..."
                    : "Rejoindre"}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
