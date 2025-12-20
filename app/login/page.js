"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "./loginService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.ok && result.data) {
        // Store user data in localStorage
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1); // 1 hour expiration

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.data.id,
            email: result.data.email,
            name: result.data.name,
            role_id: result.data.role_id,
            token: "auth_token", // You can use a real token if available
            expirationDate: expirationDate.toISOString(),
          })
        );

        // Login success, redirect based on role
        router.push("/entry");
      } else {
        alert(result.error || "Invalid credentials");
      }
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={login}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-700 placeholder-gray-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
