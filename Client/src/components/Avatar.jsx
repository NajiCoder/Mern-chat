import PropTypes from "prop-types";

export default function Avatar({ username, userId }) {
  const colors = [
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-purple-200",
    "bg-red-200",
    "bg-rose-200",
    "bg-fuchsia-200",
    "bg-cyan-200",
    "bg-teal-200",
    "bg-lime-200",
    "bg-orange-200",
    "bg-violet-200",
    "bg-emerald-200",
    "bg-gray-200",
    "bg-warmGray-200",
    "bg-trueGray-200",
    "bg-coolGray-200",
    "bg-blueGray-200",
  ];

  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length; // get a number between 0 and colors.length - 1 (inclusive) to use as an index to pick a color from the colors array
  const color = colors[colorIndex];
  return (
    <div className={`w-7 h-7 ${color} rounded-full flex items-center`}>
      <div className="w-full text-center opacity-70">{username[0]}</div>
    </div>
  );
}

Avatar.propTypes = {
  username: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};
