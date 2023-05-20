import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import { uniqBy } from "lodash";
import { BsFillSendFill } from "react-icons/bs";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "../UserContext";
import axios from "axios";

export default function Chat() {
  const [wsConnection, setWsConnection] = useState(null);

  const [onlinePeople, setOnlinePeople] = useState({}); // [{userId, username}

  const [selectedUserId, setSelectedUserId] = useState(null);

  const [newMessageText, setNewMessageText] = useState("");

  const [messages, setMessages] = useState([]);

  const { username, id } = useContext(UserContext);

  // reference the messages div so we can scroll to the bottom
  const messagesDivRef = useRef();

  // Add connection to the websocket server
  useEffect(() => {
    connectToWs();
  }, []);

  // Fix the websocket connection when it closes on every update on the server or the client lost connection
  function connectToWs() {
    // use recursion to keep trying to connect to the websocket server
    const wsConnection = new WebSocket("ws://localhost:3030");
    setWsConnection(wsConnection);
    wsConnection.addEventListener("message", handleMessage);
    wsConnection.addEventListener("close", () => {
      setTimeout(() => {
        console.log("reconnecting...");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    console.log({ event, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prevMessages) => [...prevMessages, { ...messageData }]);
    }
  }

  function selectContact(userId) {
    setSelectedUserId(userId);
  }

  function sendMessage(event) {
    event.preventDefault();
    console.log("sending...");
    wsConnection.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: newMessageText,
        sender: { name: username, id: id },
        recipient: selectedUserId,
        // we can only see the first message we send, because it doesn't have a messageId yet only the recipient has it
        messageId: Date.now(), // this will unsure that each message we send has a unique id
      },
    ]);
  }

  // use useEffect to scroll to the bottom of the messages
  useEffect(() => {
    // scroll to the bottom of the messages div when we select a new contact
    const div = messagesDivRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, [messages]);

  // get messages for the selected user
  useEffect(() => {
    if (selectedUserId) {
      axios.get(`/messages/${selectedUserId}`);
    }
  }, [selectedUserId]);

  const onlinePeopleExcludingCurrentUser = { ...onlinePeople };
  delete onlinePeopleExcludingCurrentUser[id];

  // filter out duplicate messages using lodash
  const messagesWithoutDuplicates = uniqBy(messages, "messageId");
  return (
    <div className="flex h-screen">
      <div className="bg-blue-gray w-1/3">
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
      <div className="bg-purple-light w-2/3 flex flex-col pt-4">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-500">&larr; selecte a person</div>
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div
                ref={messagesDivRef}
                className="overflow-y-scroll absolute inset-0"
              >
                {messagesWithoutDuplicates.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.sender.id === id ? "text-right " : "text-left"
                    }
                  >
                    <div
                      key={message.id}
                      className={
                        "text-left inline-block p-2 m-2 text-sm rounded-xl  " +
                        (message.sender.id === id
                          ? "bg-lavender text-gray-800"
                          : "bg-peach text-gray-600")
                      }
                    >
                      sender: {message.sender.id} <br />
                      recipient: {message.recipient} <br />
                      my id: {id} <br />
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedUserId && (
          <form className="flex gap-1 mx-2" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(event) => setNewMessageText(event.target.value)}
              placeholder="Type a message"
              className="flex-grow p-2 border rounded bg-slate-50"
            />
            <button
              type="submit"
              className="bg-blue-700 p-2 flex items-center justify-center text-white rounded-lg w-14"
            >
              <BsFillSendFill className="rotate-12 " />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
