import { MessageSquare, Lightbulb, Clock } from "lucide-react";

const Card = ({collegeName, img, branch, collegeYear, topic, noOfAnswers, postedOn}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#173f67] font-bold text-xl mb-1">{collegeName}</h2>
            <p className="text-gray-600 text-sm">{branch}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">{postedOn}</span>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative">
        <img
          src={img}
          alt="Question Image"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-gray-900 font-semibold text-lg mb-3 line-clamp-2">{topic}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <MessageSquare className="text-gray-600 w-4 h-4" />
              <span className="text-sm text-gray-600">Answer</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <Lightbulb className="text-gray-600 w-4 h-4" />
              <span className="text-sm text-gray-600">Hints</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {noOfAnswers} answers
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
