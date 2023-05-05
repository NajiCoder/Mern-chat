import { useContext } from "react";
import RegisterAndLogin from "./RegisterAndLogin";
import { UserContext } from "./UserContext";

export default function Routes() {
  const { username, id } = useContext(UserContext);
  if (username) {
    return (
      <div>
        Logged in as {username} with this id :{id}
      </div>
    );
  }
  return <RegisterAndLogin />;
}
