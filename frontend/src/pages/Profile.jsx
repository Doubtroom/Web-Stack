import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Building2, GraduationCap, Phone, Briefcase, Mail, Edit2, Save, X } from 'lucide-react';
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
    collegeName: ''
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
            email:userProfile.email || ''
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto mt-20">
        <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile
            </h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Email:</span>
                <span>{userData?.email || 'Not available'}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <span>{userData?.name || 'Not available'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">College:</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <span>{userData?.collegeName || 'Not available'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold">Branch:</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <span>{userData?.branch || 'Not available'}</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span className="font-semibold">Role:</span>
                {isEditing ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
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
                  <span>{userData?.role || 'Not available'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold">Study Type:</span>
                {isEditing ? (
                  <select
                    name="studyType"
                    value={formData.studyType}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
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
                  <span>{userData?.studyType || 'Not available'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Phone:</span>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <span>{userData?.phone || 'Not available'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-semibold">Gender:</span>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-1 rounded-md border ${
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
                  <span>{userData?.gender || 'Not available'}</span>
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