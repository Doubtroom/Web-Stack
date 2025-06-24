import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User,Calendar , Building2, GraduationCap, Phone, Briefcase, Mail, Edit2, Save, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { logout, updateProfile } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from 'antd';
import { userServices } from '../services/data.services';


const Profile = () => {
  const userProfile = useSelector((state) => state?.auth?.user);
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    studyType: '',
    phone: '',
    gender: '',
    role: '',
    collegeName: '',
    dob: ''
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [features, setFeatures] = useState(userProfile?.features || { flashcards: true });
  


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userProfile) {
          toast.error('User profile not found');
          return;
        }

        setUserData(userProfile);
        setFormData({
          name: userProfile.displayName || '',
          branch: userProfile.branch || '',
          studyType: userProfile.studyType || '',
          phone: userProfile.phone || '',
          gender: userProfile.gender || '',
          role: userProfile.role || '',
          collegeName: userProfile.collegeName || '',
          email: userProfile.email || '',
          dob: userProfile.dob || ''
        });
        setFeatures(userProfile?.features || { flashcards: true });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoutConfirm = async () => {
    setLoading(true)
    try {
      const result = await dispatch(logout()).unwrap();
      if (result){
        toast.success('Logged out successfully!');
        navigate('/landing', { state: { fromLogout: true }, replace: true });
      }
    } catch (error) {
      toast.error(error || 'Logout failed. Please try again.');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleFeatureToggle = async (feature) => {
    const newFeatures = { ...features, [feature]: !features[feature] };
    setFeatures(newFeatures);
    try {
      await userServices.updateFeatures(newFeatures);
      // If turning off the feature, reload the window
      if (newFeatures[feature] === false) {
        window.location.reload();
      }
      // Optionally show a toast for success
    } catch (error) {
      setFeatures(features); // revert
      toast.error('Failed to update features');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateProfile({ ...formData, features })).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  const formatBranchName = (branch) => {
    if (!branch) return '';
    return branch
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-3 sm:p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleLogoutCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl`}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirm Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto mt-12 sm:mt-20">
        {/* Profile Header */}
        <div className={`rounded-t-xl shadow-lg p-4 sm:p-8 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-[#1e6eab] to-[#02254b]'} text-white relative`}>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2">
            <button
              onClick={() => {
                setShowLogoutConfirm(true);
              }}
              className="hidden sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-red-700/60 hover:bg-red-500/60 transition-all text-sm sm:text-base text-white hover:text-white"
            >
              <span>Logout</span>
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all text-sm sm:text-base"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all text-sm sm:text-base"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all text-sm sm:text-base"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-8 sm:mt-0">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{userData?.displayName || 'Your Name'}</h1>
              <p className="text-white/80 text-sm sm:text-base">{userData?.role || 'Role'}</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full flex flex-col gap-2 sm:gap-4 mt-0">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200 mt-8 mb-2 sm:mb-4 flex items-center gap-2">
            <span>Features</span>
          </h2>
          <div className={`rounded-xl shadow-lg p-4 sm:p-8 ${isDarkMode ? 'bg-blue-900/60' : 'bg-blue-50'}`}> 
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-200">FlashCards</div>
                  <div className="text-sm text-blue-800 dark:text-blue-300 opacity-80">Enable active recall and spaced repetition for better learning</div>
                </div>
                <Switch
                  checked={features.flashcards}
                  onChange={() => handleFeatureToggle('flashcards')}
                  className={isDarkMode ? 'bg-blue-900' : 'bg-blue-200'}
                />
              </div>
              {/* Add more features here as needed */}
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200 mt-10 mb-2 sm:mb-4 flex items-center gap-2">
          <span>Personal Details</span>
        </h2>
        <div className={`rounded-b-xl shadow-lg p-4 sm:p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Email</span>
                </div>
                <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.email || 'Not available'}</p>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">College</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.collegeName || 'Not available'}</p>
                )}
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Branch</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{formatBranchName(userData?.branch) || 'Not available'}</p>
                )}
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Role</span>
                </div>
                {isEditing ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.role || 'Not available'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Study Type</span>
                </div>
                {isEditing ? (
                  <select
                    name="studyType"
                    value={formData.studyType}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Study Type</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="diploma">Diploma</option>
                    <option value="certification">Certification</option>
                  </select>
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.studyType || 'Not available'}</p>
                )}
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Phone</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.phone || 'Not available'}</p>
                )}
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Gender</span>
                </div>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{userData?.gender || 'Not available'}</p>
                )}
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="font-semibold text-sm sm:text-base">Date of Birth</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`ml-6 sm:ml-8 w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-sm sm:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                  />
                ) : (
                  <p className="ml-6 sm:ml-8 text-sm sm:text-base">{formatDate(userData?.dob) || 'Not available'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 