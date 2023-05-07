import { useContext } from "react";
import { UserContext } from "./UserContext";
import RegisterAndLogin from "./components/RegisterAndLogin";
import Chat from "./components/Chat";

export default function Routes() {
  const { username } = useContext(UserContext);
  if (username) {
    return (
      <div>
        <Chat />
      </div>
    );
  }
  return <RegisterAndLogin />;
}
