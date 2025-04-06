import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Upload, Trash2, HelpCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import DataService from '../firebase/DataService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSelector } from 'react-redux';

// Styled components
const StyledPaper = styled(Paper)(({ theme, isDarkMode }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: isDarkMode 
    ? 'linear-gradient(145deg, #1f2937 0%, #111827 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  color: isDarkMode ? '#ffffff' : '#000000',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const ImagePreview = styled('img')({
  maxWidth: '200px',
  maxHeight: '200px',
  marginTop: '16px',
  objectFit: 'contain',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
});

const StyledTextField = styled(TextField)(({ theme, isDarkMode }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: isDarkMode ? '#4f46e5' : '#1a365d',
    },
    color: isDarkMode ? '#ffffff' : '#000000',
    '& fieldset': {
      borderColor: isDarkMode ? '#4f46e5' : '#1a365d',
    },
  },
  '& .MuiFocused-root': {
    '& fieldset': {
      borderColor: isDarkMode ? '#6366f1' : '#1a365d',
    },
  },
  '& .MuiInputLabel-root': {
    color: isDarkMode ? '#9ca3af' : '#1a365d',
  },
}));

const SubmitButton = styled('button')(({ isDarkMode }) => ({
  width: '100%',
  padding: '14px 28px',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: isDarkMode ? '#4f46e5' : '#1a365d',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: isDarkMode ? '#6366f1' : '#173f67',
    transform: 'translateY(-2px)',
    boxShadow: isDarkMode 
      ? '0 4px 12px rgba(99, 102, 241, 0.3)'
      : '0 4px 12px rgba(26, 54, 93, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    backgroundColor: isDarkMode ? '#6b7280' : '#9fa8da',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
}));

const TopicChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'isDarkMode' && prop !== 'isSelected'
})(({ isDarkMode, isSelected }) => ({
  margin: '4px',
  backgroundColor: isSelected
    ? isDarkMode 
      ? '#4f46e5'  // Indigo-600 for dark mode selected
      : '#1a365d'  // Blue-900 for light mode selected
    : isDarkMode
      ? '#312e81'  // Indigo-900 for dark mode unselected
      : '#e8eaf6', // Indigo-50 for light mode unselected
  color: isSelected
    ? '#ffffff'    // White text for selected
    : isDarkMode
      ? '#e0e7ff'  // Indigo-100 for dark mode unselected
      : '#1a365d', // Blue-900 for light mode unselected
  '&:hover': {
    backgroundColor: isSelected
      ? isDarkMode
        ? '#4338ca'  // Indigo-700 for dark mode selected hover
        : '#173f67'  // Blue-800 for light mode selected hover
      : isDarkMode
        ? '#4338ca'  // Indigo-700 for dark mode unselected hover
        : '#c5cae9', // Indigo-200 for light mode unselected hover
  },
  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
  transition: 'all 0.2s ease-in-out',
  boxShadow: isSelected
    ? isDarkMode
      ? '0 2px 8px rgba(99, 102, 241, 0.3)'
      : '0 2px 8px rgba(26, 54, 93, 0.3)'
    : 'none',
}));

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'isDarkMode'
})(({ theme, isDragActive, isDarkMode }) => ({
  border: `2px dashed ${isDragActive 
    ? (isDarkMode ? '#4f46e5' : '#1a365d')
    : (isDarkMode ? '#4b5563' : '#bdbdbd')}`,
  borderRadius: '12px',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive 
    ? (isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(26, 54, 93, 0.05)')
    : (isDarkMode ? '#1f2937' : '#fafafa'),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: isDarkMode ? '#4f46e5' : '#1a365d',
    backgroundColor: isDarkMode 
      ? 'rgba(99, 102, 241, 0.1)' 
      : 'rgba(26, 54, 93, 0.05)',
  },
}));

const LoadingOverlay = styled(Backdrop)(({ theme, isDarkMode }) => ({
  color: '#ffffff',
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: isDarkMode ? '#111827' : 'white',
  opacity: 0.5,
}));

const LoadingContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const validateForm = (formData) => {
  const errors = {};
  if (!formData.topic.trim()) {
    errors.topic = 'Topic is required';
  }
  if (!formData.branch) {
    errors.branch = 'Branch is required';
  }
  if (!formData.question.trim() && !formData.image) {
    errors.question = 'Either question text or image is required';
  }
  return errors;
};

const AskQuestion = () => {
  const navigate = useNavigate();
  const dataService = new DataService('questions');
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    topic: '',
    branch: '',
    customBranch: '',
    image: null,
    collegeName: userData.collegeName || '',
    postedBy: userData.uid
  });

  // Error state
  const [errors, setErrors] = useState({});

  const [showCustomBranch, setShowCustomBranch] = useState(false);
  const [showCustomTopic, setShowCustomTopic] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const [imagePreview, setImagePreview] = useState(null);

  // Additional state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestedTopics = [
    'Mathematics', 'Physics', 'Chemistry', 'Programming',
    'Data Structures', 'Algorithms', 'Machine Learning',
    'Database', 'Networking', 'Operating Systems'
  ];

  const branches = [
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'mechanical_engineering', label: 'Mechanical Engineering' },
    { value: 'electrical_engineering', label: 'Electrical Engineering' },
    { value: 'civil_engineering', label: 'Civil Engineering' },
    { value: 'chemical_engineering', label: 'Chemical Engineering' },
    { value: 'aerospace_engineering', label: 'Aerospace Engineering' },
    { value: 'biomedical_engineering', label: 'Biomedical Engineering' },
    { value: 'electronics_engineering', label: 'Electronics Engineering' },
    { value: 'information_technology', label: 'Information Technology' },
    { value: 'automation_engineering', label: 'Automation Engineering' },
    { value: 'robotics_engineering', label: 'Robotics Engineering' },
    { value: 'metallurgical_engineering', label: 'Metallurgical Engineering' },
    { value: 'mining_engineering', label: 'Mining Engineering' },
    { value: 'textile_engineering', label: 'Textile Engineering' },
    { value: 'agricultural_engineering', label: 'Agricultural Engineering' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle branch selection
    if (name === 'branch') {
      setShowCustomBranch(value === 'custom');
      if (value !== 'custom') {
        setFormData(prev => ({
          ...prev,
          customBranch: ''
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please upload an image file',
        }));
        return;
      }

      // Validate file size (max  5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size should be less than 5MB',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopics([topic]);
    setFormData(prev => ({
      ...prev,
      topic: topic
    }));
    setShowCustomTopic(false);
    setCustomTopic('');
  };

  const handleCustomTopicChange = (e) => {
    const value = e.target.value;
    setCustomTopic(value);
    setFormData(prev => ({
      ...prev,
      topic: value
    }));
  };

  const handleTopicToggle = () => {
    setShowCustomTopic(!showCustomTopic);
    if (!showCustomTopic) {
      setSelectedTopics([]);
      setFormData(prev => ({
        ...prev,
        topic: customTopic
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload({ target: { files: [file] } });
    } else {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload an image file',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    try {
      let photoData = null;
      if (formData.image) {
        photoData = await dataService.uploadImage(formData.image);
      }

      const { image, ...questionData } = formData; 
      const finalQuestionData = {
        ...questionData,
        postedBy: userData.uid,
        createdAt: new Date().toISOString(),
        branch: formData.branch === 'custom' ? formData.customBranch : formData.branch,
        photo: photoData?.url || null,
        photoId: photoData?.fileId || null
      };

      await dataService.addQuestion(finalQuestionData);
      
      setFormData({
        question: '',
        topic: '',
        branch: '',
        customBranch: '',
        image: null,
        collegeName: userData.collegeName || '',
        postedBy: userData.uid
      });
      setImagePreview(null);
      setErrors({});
      setSelectedTopics([]);
      
      toast.success('Question submitted successfully!');
      navigate('/my-questions');
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pt-24">
      <Container maxWidth="md">
        <StyledPaper isDarkMode={isDarkMode}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            className={isDarkMode ? "text-blue-400" : "text-[#1a365d]"}
          >
            Ask a Question
          </Typography>
          
          {error && (
            <div className={`${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-4 rounded-lg mb-6`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`}>
                Topic
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedTopics.map((topic) => (
                  <TopicChip
                    key={topic}
                    label={topic}
                    onClick={() => handleTopicClick(topic)}
                    isDarkMode={isDarkMode}
                    isSelected={selectedTopics.includes(topic)}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleTopicToggle}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    showCustomTopic
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-[#1a365d] text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showCustomTopic ? 'Use Suggested Topics' : 'Custom Topic'}
                </button>
              </div>
              {showCustomTopic && (
                <input
                  type="text"
                  value={customTopic}
                  onChange={handleCustomTopicChange}
                  placeholder="Enter your custom topic"
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400' 
                      : 'border-gray-300 bg-white text-gray-900 focus:ring-[#1a365d]'
                  } focus:ring-2 focus:border-transparent`}
                />
              )}
              {errors.topic && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.topic}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`}>
                Branch
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400' 
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-[#1a365d]'
                } focus:ring-2 focus:border-transparent`}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.branch}
                </p>
              )}
            </div>

            {showCustomBranch && (
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`}>
                  Specify Branch
                </label>
                <input
                  type="text"
                  name="customBranch"
                  value={formData.customBranch}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400' 
                      : 'border-gray-300 bg-white text-gray-900 focus:ring-[#1a365d]'
                  } focus:ring-2 focus:border-transparent`}
                  placeholder="Enter your branch"
                />
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`}>
                Your Question
              </label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                rows="4"
                className={`w-full p-2 border rounded-lg resize-none ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-400' 
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-[#1a365d]'
                } focus:ring-2 focus:border-transparent`}
                placeholder="Type your question here..."
              />
              {errors.question && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.question}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`}>
                Add Image (Optional)
              </label>
              <DropZone
                isDragActive={isDragActive}
                isDarkMode={isDarkMode}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'} mb-2`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    PNG, JPG or JPEG (MAX. 5MB)
                  </p>
                </label>
              </DropZone>
              {imagePreview && (
                <div className="mt-4 relative">
                  <ImagePreview src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className={`absolute top-2 right-2 p-1 rounded-full shadow-md ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <X className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-[#1a365d]'}`} />
                  </button>
                </div>
              )}
              {errors.image && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {errors.image}
                </p>
              )}
            </div>

            <SubmitButton type="submit" disabled={isSubmitting} isDarkMode={isDarkMode}>
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Posting...
                </>
              ) : (
                'Post Question'
              )}
            </SubmitButton>
          </form>
        </StyledPaper>
      </Container>
    </div>
  );
};

export default AskQuestion;