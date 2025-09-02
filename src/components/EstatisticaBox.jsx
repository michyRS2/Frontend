import React from "react";

const EstatisticaBox = ({ titulo, valor }) => {
  return (
    <div className="border rounded-md bg-white shadow p-4 text-center">
      <p className="text-gray-500 font-medium">{titulo}</p>
      <p className="text-3xl font-bold">{valor}</p>
    </div>
  );
};

export default EstatisticaBox;
