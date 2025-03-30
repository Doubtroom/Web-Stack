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
import { Upload, Trash2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import DataService from '../firebase/DataService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#1a237e',
    },
  },
  '& .MuiFocused-root': {
    '& fieldset': {
      borderColor: '#1a237e',
    },
  },
}));

const SubmitButton = styled('button')({
  width: '100%',
  padding: '14px 28px',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#1a237e',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: '#283593',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    backgroundColor: '#9fa8da',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
});

const TopicChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  backgroundColor: '#e8eaf6',
  color: '#1a237e',
  '&:hover': {
    backgroundColor: '#c5cae9',
  },
}));

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive'
})(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#1a237e' : '#bdbdbd'}`,
  borderRadius: '12px',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? 'rgba(26, 35, 126, 0.05)' : '#fafafa',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#1a237e',
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
  },
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  color: '#ffffff',
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: 'rgba(26, 35, 126, 0.95)',
}));

const LoadingContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

// Form validation function
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
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    topic: '',
    branch: '',
    customBranch: '',
    image: null,
    collegeName: userData.collegeName || '', // Add college name from user profile
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Additional state for branch selection
  const [showCustomBranch, setShowCustomBranch] = useState(false);

  // Image preview state
  const [imagePreview, setImagePreview] = useState(null);

  // Additional state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const suggestedTopics = [
    'Mathematics', 'Physics', 'Chemistry', 'Programming',
    'Data Structures', 'Algorithms', 'Machine Learning',
    'Database', 'Networking', 'Operating Systems'
  ];

  const branches = [
    { value: "computer_science", label: "Computer Science" },
    { value: "mechanical", label: "Mechanical Engineering" },
    { value: "electrical", label: "Electrical Engineering" },
    { value: "civil", label: "Civil Engineering" },
    { value: "chemical", label: "Chemical Engineering" },
    { value: "aerospace", label: "Aerospace Engineering" },
    { value: "biomedical", label: "Biomedical Engineering" },
    { value: "electronics", label: "Electronics Engineering" },
    { value: "information_technology", label: "Information Technology" },
    { value: "automation", label: "Automation Engineering" },
    { value: "robotics", label: "Robotics Engineering" },
    { value: "metallurgy", label: "Metallurgical Engineering" },
    { value: "mining", label: "Mining Engineering" },
    { value: "textile", label: "Textile Engineering" },
    { value: "agricultural", label: "Agricultural Engineering" },
    { value: "custom", label: "Other (Specify)" }
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

      // Validate file size (max 5MB)
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
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
      // Update the topic input field with the clicked topic
      setFormData(prev => ({
        ...prev,
        topic: topic
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit the question using DataService
      await dataService.addQuestion(formData);
      
      // Reset form
      setFormData({
        question: '',
        topic: '',
        branch: '',
        customBranch: '',
        image: null,
        collegeName: userData.collegeName || '', // Keep the college name
      });
      setImagePreview(null);
      setErrors({});
      setSelectedTopics([]);
      
      toast.success('Question submitted successfully!');
      navigate('/myquestions');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className='mt-20' maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledPaper elevation={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#1a237e',
              fontWeight: 'bold',
              mb: 4
            }}
          >
            Ask a Question
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              label="Your Question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              error={!!errors.question}
              helperText={errors.question || "Required if no image is uploaded"}
              multiline
              rows={4}
              margin="normal"
              placeholder="What would you like to know?"
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 1 }}>
                Suggested Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedTopics.map((topic) => (
                  <TopicChip
                    key={topic}
                    label={topic}
                    onClick={() => handleTopicClick(topic)}
                    color={selectedTopics.includes(topic) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>

            <StyledTextField
              fullWidth
              label="Related Topic *"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              error={!!errors.topic}
              margin="normal"
            />

            <FormControl fullWidth margin="normal" error={!!errors.branch}>
              <InputLabel>Related Branch *</InputLabel>
              <Select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                label="Related Branch *"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1a237e',
                  },
                }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.branch && (
                <Typography color="error" variant="caption">
                  {errors.branch}
                </Typography>
              )}
            </FormControl>

            {showCustomBranch && (
              <StyledTextField
                fullWidth
                label="Specify Your Branch"
                name="customBranch"
                value={formData.customBranch}
                onChange={handleInputChange}
                error={!!errors.customBranch}
                margin="normal"
                placeholder="Enter your branch name"
              />
            )}

            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload">
                <DropZone
                  isDragActive={isDragActive}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Upload size={40} color="#1a237e" />
                    <Typography variant="h6" color="primary">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag and drop your image here, or click to browse
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: JPG, PNG, GIF (max 5MB)
                    </Typography>
                  </Box>
                </DropZone>
              </label>
              {errors.image && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.image}
                </Typography>
              )}
              {imagePreview && (
                <Box sx={{ position: 'relative', display: 'inline-block', mt: 2 }}>
                  <ImagePreview src={imagePreview} alt="Preview" />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: null }));
                      setImagePreview(null);
                    }}
                  >
                    <Trash2 size={20} />
                  </IconButton>
                </Box>
              )}
            </Box>

            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              style={{ 
                marginTop: '32px',
                marginBottom: '16px',
                height: '48px'
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress 
                    size={20} 
                    sx={{ 
                      color: 'white',
                      marginRight: '8px'
                    }} 
                  />
                  Submitting...
                </>
              ) : (
                'Submit Question'
              )}
            </SubmitButton>
          </Box>
        </StyledPaper>
      </motion.div>

      <LoadingOverlay
        open={isSubmitting}
        transitionDuration={500}
      >
        <LoadingContent>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{
              color: '#ffffff',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff',
              fontWeight: 600,
              mt: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Submitting your question...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              maxWidth: '300px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Please wait while we process your question. This may take a few moments.
          </Typography>
        </LoadingContent>
      </LoadingOverlay>
    </Container>
  );
};

export default AskQuestion;