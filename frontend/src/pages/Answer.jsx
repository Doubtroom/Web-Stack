import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  ThumbsUp,
  Clock,
  ArrowLeft,
  ZoomIn,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnswerById } from "../store/dataSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import { toast } from "sonner";
import CommentSection from "../components/CommentSection";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useSmartUpvote } from "../hooks/useSmartUpvote";

const Answer = () => {
  const { questionId, answerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleUpvote, userData } = useSmartUpvote();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const commentSectionRef = useRef(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { currentAnswer, currentQuestion, loading, error } = useSelector(
    (state) => state.data,
  );

  useEffect(() => {
    if (answerId) {
      fetchData();
    }
  }, [answerId, questionId]);

  useEffect(() => {
    // Check if we should scroll to comments
    if (
      searchParams.get("scroll") === "comments" &&
      commentSectionRef.current &&
      !loading
    ) {
      setTimeout(() => {
        const yOffset = -100;
        const element = commentSectionRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [searchParams, loading]);

  const fetchData = async () => {
    try {
      if (!answerId) {
        toast.error("Invalid answer ID");
        return;
      }
      await dispatch(fetchAnswerById({ answerId })).unwrap();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to fetch answer details. Please try again later.");
    }
  };

  const handleBackToQuestion = async () => {
    const qId = currentAnswer?.questionId;

    if (!qId) {
      toast.error("Could not find question ID");
      navigate("/home");
      return;
    }
    navigate(`/question/${qId}`);
  };

  const handleReply = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleUpvoteClick = async () => {
    if (isUpvoting) return;

    setIsUpvoting(true);
    try {
      await handleUpvote(answerId);
    } finally {
      setIsUpvoting(false);
    }
  };

  if (loading && !currentAnswer) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/home")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto lg:pt-24 pb-12 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 inline-flex items-center"
          onClick={handleBackToQuestion}
          children={
            <>
              <ArrowLeft className="w-4 h-4 mr-2 text-[#173f67] dark:text-[#3f7cc6]" />
              <span className="text-[#173f67] dark:text-[#3f7cc6]">
                Back to Question
              </span>
            </>
          }
        />

        {/* Answer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {currentAnswer?.role === "faculty" ||
                  currentAnswer?.role === "faculty(Phd)"
                    ? currentAnswer?.userName
                    : "Anonymous"}
                </h3>
                {currentAnswer?.role === "faculty" ||
                  (currentAnswer?.role === "faculty(Phd)" && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {currentAnswer?.role === "faculty"
                        ? "Faculty"
                        : "Faculty (Phd)"}
                    </span>
                  ))}
                {currentAnswer?.collegeName && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      currentAnswer.collegeName === userData.collegeName
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {currentAnswer.collegeName === userData.collegeName
                      ? "My College"
                      : "Other College"}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(currentAnswer?.createdAt)}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {currentAnswer?.text}
            </p>
          </div>

          {currentAnswer?.photoUrl && (
            <div
              className="rounded-lg overflow-hidden mb-8 relative group cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={currentAnswer.photoUrl}
                alt="Answer"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                style={{
                  borderRadius: "0.75rem",
                  maxHeight: "60vh",
                  width: "100%",
                }}
              />
            </div>
          )}
          {currentAnswer?.photoUrl && (
            <Lightbox
              open={isLightboxOpen}
              close={() => setIsLightboxOpen(false)}
              slides={[{ src: currentAnswer.photoUrl }]}
              plugins={[Zoom]}
              zoom={{
                maxZoomPixelRatio: 3,
                zoomInMultiplier: 2,
                doubleTapDelay: 300,
                doubleClickDelay: 300,
                doubleClickMaxStops: 2,
                keyboardMoveDistance: 50,
                wheelZoomDistanceFactor: 100,
                pinchZoomDistanceFactor: 100,
                scrollToZoom: true,
              }}
              render={{ buttonPrev: () => null, buttonNext: () => null }}
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              disabled={isUpvoting}
              variant="ghost"
              size="sm"
              className={`px-4 inline-flex items-center transition-all duration-200 ${
                currentAnswer?.upvotedBy?.includes(userData.userId)
                  ? "text-[#173f67] dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              } ${isUpvoting ? "opacity-50 cursor-not-allowed" : "hover:text-[#173f67] dark:hover:text-blue-400 hover:scale-105 active:scale-95"}`}
              onClick={handleUpvoteClick}
              children={
                <>
                  <ThumbsUp
                    className={`w-4 h-4 mr-2 transition-all duration-200 ${
                      currentAnswer?.upvotedBy?.includes(userData.userId)
                        ? "fill-current"
                        : ""
                    } text-[#173f67] dark:text-[#3f7cc6] ${isUpvoting ? "animate-pulse" : ""}`}
                  />
                  <span className="text-[#173f67] dark:text-[#3f7cc6]">
                    {isUpvoting ? "Updating..." : "Upvote"}
                  </span>
                </>
              }
            />
            <span className="text-base font-semibold text-[#173f67] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full transition-all duration-200">
              {currentAnswer?.upvotes || 0}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="px-4 inline-flex items-center text-[#173f67] dark:text-[#3f7cc6]"
              onClick={handleReply}
              children={
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Reply</span>
                </>
              }
            />
          </div>
        </div>

        {/* Comments Section */}
        <div
          ref={commentSectionRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Comments
            </h2>
          </div>
          <CommentSection answerId={answerId} />
        </div>
      </div>
    </div>
  );
};

export default Answer;
