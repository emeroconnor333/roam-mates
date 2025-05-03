import React from "react";

type Props = {
  onChange: (value: string) => void;
};

const UserInput: React.FC<Props> = ({ onChange }) => {
  // Temporary for debugging — logs the entered user ID
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("User ID entered:", value); // 🐛 Debugging log
    onChange(value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Enter your Name
      </label>
      <input
        type="text"
        onChange={handleChange}
        placeholder="e.g. user_abc123"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-holiday-red"
      />
    </div>
  );
};

export default UserInput;
