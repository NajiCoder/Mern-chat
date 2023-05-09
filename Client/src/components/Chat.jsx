import { useContext, useState } from "react";
import { useEffect } from "react";
import { BsFillSendFill } from "react-icons/bs";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "../UserContext";

export default function Chat() {
  const [wsConnection, setWsConnection] = useState(null);

  const [onlinePeople, setOnlinePeople] = useState({}); // [{userId, username}

  const [selectedUserId, setSelectedUserId] = useState(null);

  const { username, id } = useContext(UserContext);

  // Add connection to the websocket server
  useEffect(() => {
    const wsConnection = new WebSocket("ws://localhost:3030");
    setWsConnection(wsConnection);
    wsConnection.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }
  }

  function selectContact(userId) {
    setSelectedUserId(userId);
  }

  const onlinePeopleExcludingCurrentUser = { ...onlinePeople };
  delete onlinePeopleExcludingCurrentUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-blue-100 w-1/3">
        <Logo />
        {Object.keys(onlinePeopleExcludingCurrentUser).map((userId, index) => (
          <div
            onClick={() => selectContact(userId)}
            className={
              "flex items-center gap-2 border-b border-gray-100 " +
              (userId === selectedUserId ? "bg-rose-100" : "")
            }
            key={index}
          >
            {userId === selectedUserId && (
              <div className="w-1 h-10 bg-blue-700 rounded-md"></div>
            )}

            <div className="flex items-center gap-2 py-2 pl-4">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-blue-300 w-2/3 flex flex-col pt-4">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-500">&larr; selecte a person</div>
            </div>
          )}
        </div>
        <div className="flex gap-1 mx-2">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-grow p-2 border rounded bg-slate-50"
          />
          <button className="bg-blue-700 p-2 flex items-center justify-center text-white rounded-lg w-14">
            <BsFillSendFill className="rotate-12 " />
          </button>
        </div>
      </div>
    </div>
  );
}
