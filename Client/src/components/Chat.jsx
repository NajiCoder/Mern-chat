import { useState } from "react";
import { useEffect } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { IoMdChatbubbles } from "react-icons/io";

export default function Chat() {
  const [wsConnection, setWsConnection] = useState(null);

  const [onlinePeople, setOnlinePeople] = useState({}); // [{userId, username}

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

  return (
    <div className="flex h-screen">
      <div className="bg-blue-100 w-1/3 pl-4 pt-4">
        <div className="text-xl text-blue-700 font-bold flex gap-1 items-center mb-4">
          {" "}
          <IoMdChatbubbles /> MernChat
        </div>
        {Object.keys(onlinePeople).map((userId, index) => (
          <div className="border-b border-gray-100 py-2" key={index}>
            {onlinePeople[userId]}
          </div>
        ))}
      </div>
      <div className="bg-blue-300 w-2/3 flex flex-col pt-4">
        <div className="flex-grow">Messages here</div>
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
