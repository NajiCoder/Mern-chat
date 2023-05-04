import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  console.log("test");

  async function register(event) {
    event.preventDefault();
    console.log("hi");
    await axios.post("/register", { username, password });
    console.log("Bye");
  }

  return (
    <div className="bg-blue-100 h-screen flex items-center">
      <form className="w-64 mx-auto mb-10" onSubmit={register}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button
          type="submit"
          className="bg-blue-400 text-white w-full rounded-sm p-2"
        >
          Register
        </button>
      </form>
    </div>
  );
}
