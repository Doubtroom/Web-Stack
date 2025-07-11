import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createAnswer, fetchQuestionById } from "../store/dataSlice";
import { questionServices } from "../services/data.services";
import { toast } from "sonner";
import Button from "../components/Button";

const AnswerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    photo: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const validateQuestion = async () => {
      if (!id) {
        toast.error("Invalid question ID");
        navigate("/");
        return;
      }

      try {
        const questionData = await questionServices.getQuestion(id);

        if (!questionData.data) {
          toast.error("Question not found");
          navigate("/");
          return;
        }

        setQuestion(questionData.data);
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch question details",
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    validateQuestion();
  }, [id, navigate]);

  const handleTextChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      text: e.target.value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: null,
    }));
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      toast.error("Invalid question ID");
      return;
    }

    if (!formData.text.trim() && !formData.photo) {
      toast.error("Please provide either text or photo for your answer");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      if (formData.text.trim()) {
        data.append("text", formData.text.trim());
      }
      data.append("questionId", id);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      dispatch(createAnswer({ formData: data, questionId: id }))
        .unwrap()
        .then(() => {
          toast.success("Answer posted successfully!");
          dispatch(fetchQuestionById(id));
          window.scrollTo(0, 0);
          navigate(`/question/${id}`);
        })
        .catch((error) => {
          console.error("Error posting answer:", error);
          toast.error(error || "Failed to post answer. Please try again.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    } catch (error) {
      console.error("Error preparing form data:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  const AnswerFormSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-2 lg:pt-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-start mb-4">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
          <div className="space-y-6">
            {/* Text Input Skeleton */}
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
            </div>

            {/* Photo Upload Skeleton */}
            <div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex justify-end gap-4">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <AnswerFormSkeleton />;
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pt-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-start mb-4">
          <Button
            className="mb-4"
            variant="outline"
            onClick={() => navigate(`/question/${id}`)}
          >
            Refer to Question
          </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#173f67] dark:text-blue-400 mb-6">
            Post Your Answer
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div>
              <label
                htmlFor="answer"
                className="block text-sm font-medium text-[#173f67] dark:text-blue-400 mb-2"
              >
                Your Answer Text
              </label>
              <textarea
                id="answer"
                rows="6"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#173f67] dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Write your answer here... (Optional if you're uploading a photo)"
                value={formData.text}
                onChange={handleTextChange}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#173f67] dark:text-blue-400 mb-2">
                Add Photo
              </label>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <X className="w-4 h-4 text-[#173f67] dark:text-blue-400" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 dark:border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-[#173f67] dark:text-blue-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                    <p className="text-xs text-[#173f67] dark:text-blue-400 mt-2">
                      (Optional if you're providing text)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/question/${id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Answer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnswerForm;
