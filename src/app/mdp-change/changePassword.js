"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { postData } from "@/services/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
   

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(true);
      return;
    }

    try {
      const response = await postData("change-password", { email, password});
      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Password changed successfully. You can now log in.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.message || "Error changing password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <p className="text-center mt-20 text-red-500">Invalid request. Email is missing.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 bg-opacity-60 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-white">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-white">New Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="block mb-2 text-white">Confirm New Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              " Change Password"
            )}
        </button>
      </form>
    </div>


    
  );
}