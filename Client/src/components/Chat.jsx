import { BsFillSendFill } from "react-icons/bs";

export default function Chat() {
  return (
    <div className="flex h-screen">
      <div className="bg-blue-100 w-1/3">Contacts</div>
      <div className="bg-blue-300 w-2/3 flex flex-col">
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
