import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { HelpCircle, Clock, ArrowLeft } from "lucide-react";
import { questionServices } from "../services/data.services";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const SearchResults = () => {
  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  useEffect(() => {
    const searchData = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await questionServices.getFilteredQuestions({
          search: query,
        });
        const formattedResults = response.data.questions.map((q) => ({
          ...q,
          id: q._id,
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to perform search");
      } finally {
        setIsLoading(false);
      }
    };

    searchData();
  }, [query]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const highlightMatch = (text) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className={`${isDarkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-800"} px-1 rounded`}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:mt-20">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 ${
            isDarkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <h1
        className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        Search Results for "{decodeURIComponent(query)}"
      </h1>

      {results.length === 0 ? (
        <div
          className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No results found for your search.</p>
          <p className="mt-2">
            Try using different keywords or check your spelling.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => (
            <Link
              key={result.id}
              to={`/question/${result.id}`}
              className={`block p-6 rounded-lg transition-all ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <HelpCircle
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-[#173f67]"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-lg mb-3 ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {highlightMatch(result.text)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {result.topic && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        Topic: {highlightMatch(result.topic)}
                      </span>
                    )}
                    {result.branch && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Branch: {highlightMatch(result.branch)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <span>{result.college}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(result.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
