import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User,Calendar , Building2, GraduationCap, Phone, Briefcase, Mail, Edit2, Save, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import DataService from '../firebase/DataService';
import userService from '../firebase/UserService';

const Profile = () => {
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const dataService = new DataService("users");
        const userProfile = await dataService.getUserData(storedUserData.uid);
        
        if (userProfile) {
          setUserData(userProfile);
          setFormData({
            name: userProfile.name || '',
            branch: userProfile.branch || '',
            studyType: userProfile.studyType || '',
            phone: userProfile.phone || '',
            gender: userProfile.gender || '',
            role: userProfile.role || '',
            collegeName: userProfile.collegeName || '',
            email: userProfile.email || '',
            dob: userProfile.dob || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
      await userService.saveUserProfile(storedUserData.uid, formData);
      
      // Update local storage with new data
      const updatedUserData = {
        ...storedUserData,
        displayName: formData.name,
        collegeName: formData.collegeName,
        branch: formData.branch
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      
      setUserData(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      <div className="max-w-4xl mx-auto mt-12 sm:mt-20">
        {/* Profile Header */}
        <div className={`rounded-t-xl shadow-lg p-4 sm:p-8 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-[#1e6eab] to-[#02254b]'} text-white relative`}>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
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
              <h1 className="text-2xl sm:text-3xl font-bold">{userData?.name || 'Your Name'}</h1>
              <p className="text-white/80 text-sm sm:text-base">{userData?.role || 'Role'}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
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
            </div>

            <div className="space-y-4 sm:space-y-6">
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