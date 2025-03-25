import { Pencil, Lightbulb } from "lucide-react";
import Screenshot from "../assets/Screenshot 2025-02-28 001635.png";

const Card = () => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-2xl p-5 max-w-3xl border border-gray-200 cursor-pointer">
      <div className="mb-4">
        <h2 className="text-[#173f67] font-bold text-lg">NIT Agartala</h2>
        <p className="text-gray-700 text-sm">Electrical Engineering</p>
      </div>

      <img
        src={Screenshot}
        alt="Climbing stairs"
        className="w-full h-44 object-cover rounded-xl mb-4 border border-gray-200"
      />

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition duration-200">
          <Pencil className="text-gray-700 w-5 h-5" />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition duration-200">
          <Lightbulb className="text-gray-700 w-5 h-5" />
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">5 answers</p>
      <p className="font-semibold text-base text-gray-900">Network Analysis</p>
      
      <p className="text-gray-500 text-xs mt-3">
        Posted on: <span className="text-black font-medium">2025-01-15</span>
      </p>
    </div>
  );
};

export default Card;
