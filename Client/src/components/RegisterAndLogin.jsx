import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function RegisterAndLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoginOrRegister, setIsLoginOrRegister] = useState("Register");

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(event) {
    event.preventDefault();
    const url = isLoginOrRegister === "Register" ? "/register" : "/login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-blue-100 h-screen flex items-center">
      <form className="w-64 mx-auto mb-10" onSubmit={handleSubmit}>
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
          {isLoginOrRegister === "Register" ? "Register" : "Log in"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "Register" && (
            <div>
              Already have an account?
              <button onClick={() => setIsLoginOrRegister("Login")}>
                Log in here
              </button>
            </div>
          )}
          {isLoginOrRegister === "Login" && (
            <div>
              Do not have an account?
              <button onClick={() => setIsLoginOrRegister("Register")}>
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
