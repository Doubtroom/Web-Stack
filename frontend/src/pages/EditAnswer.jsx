import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ArrowLeft } from "lucide-react";
import { answerServices } from "../services/data.services";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import { toast } from "sonner";

const EditAnswer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    photo: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const res = await answerServices.getAnswer(id);
        const answerData = res.data.answer;
        if (answerData) {
          setAnswer(answerData);
          setFormData({
            text: answerData.text || "",
            photo: null,
          });
          setPreviewUrl(answerData.photoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching answer:", error);
        toast.error("Failed to fetch answer details");
        navigate("/my-questions");
      }
    };

    fetchAnswer();
  }, [id, navigate]);

  // Scroll to top when loading starts
  useEffect(() => {
    if (loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, photo: null }));
    setRemovePhoto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("text", formData.text.trim());

      if (formData.photo) {
        data.append("photo", formData.photo);
      } else if (removePhoto) {
        data.append("removePhoto", "true");
      }

      await answerServices.updateAnswer(id, data);
      toast.success("Answer updated successfully!");
      navigate("/my-questions");
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to update answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!answer) {
    return null;
  }
  const handleCancel = (e) => {
    e.preventDefault();
    navigate("/my-questions");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pt-24">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6 text-gray-700 dark:text-gray-200 dark:hover:text-white hover:text-gray-700"
          onClick={() => navigate("/my-questions")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Content
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#173f67] dark:text-white mb-6">
            Edit Answer
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Answer Text */}
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-[#173f67] dark:text-gray-200 mb-2"
              >
                Answer
              </label>
              <textarea
                id="text"
                name="text"
                rows="6"
                value={formData.text}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#173f67] focus:border-transparent resize-none dark:bg-gray-700 dark:text-white text-black"
                placeholder="Write your answer here..."
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#173f67] dark:text-gray-200 mb-2">
                Photo (Optional)
              </label>
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                    <label
                      htmlFor="photo-upload"
                      className="text-white font-semibold cursor-pointer px-4 py-2 bg-black/50 rounded-md hover:bg-black/70"
                    >
                      Change Photo
                    </label>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-white font-semibold cursor-pointer px-4 py-2 bg-red-600/80 rounded-md hover:bg-red-700/80 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-[#173f67] dark:text-gray-200 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG or JPEG (MAX. 5MB)
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
                onClick={(e) => handleCancel(e)}
                className=" dark:hover:text-white dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Answer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAnswer;
