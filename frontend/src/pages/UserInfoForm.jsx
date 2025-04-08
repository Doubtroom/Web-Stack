import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, Phone, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import userService from '../firebase/UserService';
import { useDispatch } from 'react-redux';
import { updateProfileCompletion } from '../redux/profileSlice';

const UserInfoForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        collegeName: '',
        branch: '',
        otherBranch: '',
        studyType: '',
        phone: '',
        gender: '',
        role: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Check if user is coming from signup
    const fromSignup = localStorage.getItem("fromSignup") === "true";
    
    // Prevent navigation away from this page if coming from signup
    useEffect(() => {
        if (fromSignup) {
            // Disable browser back button
            window.history.pushState(null, '', window.location.href);
            
            // Handle browser back button
            const handlePopState = (e) => {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
            };
            
            window.addEventListener('popstate', handlePopState);
            
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [fromSignup]);

    const studyTypes = [
        { value: 'bachelor', label: 'Bachelor\'s Degree' },
        { value: 'master', label: 'Master\'s Degree' },
        { value: 'phd', label: 'PhD' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'certification', label: 'Certification' }
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
        { value: 'agricultural_engineering', label: 'Agricultural Engineering' },
        { value: 'custom', label: 'Other (Specify)' }
    ];

    const colleges = [
        { value: 'nit_agartala', label: 'National Institute of Technology Agartala' },
        { value: 'iiit_agartala', label: 'Indian Institute of Information Technology Agartala' },
        { value: 'iit_bombay', label: 'Indian Institute of Technology Bombay' },
        { value: 'iit_delhi', label: 'Indian Institute of Technology Delhi' },
        { value: 'iit_madras', label: 'Indian Institute of Technology Madras' },
        { value: 'iit_kanpur', label: 'Indian Institute of Technology Kanpur' },
        { value: 'iit_kharagpur', label: 'Indian Institute of Technology Kharagpur' },
        { value: 'iit_roorkee', label: 'Indian Institute of Technology Roorkee' },
        { value: 'iit_guwahati', label: 'Indian Institute of Technology Guwahati' },
        { value: 'nit_trichy', label: 'National Institute of Technology Tiruchirappalli' },
        { value: 'nit_surathkal', label: 'National Institute of Technology Karnataka' },
        { value: 'nit_warangal', label: 'National Institute of Technology Warangal' },
        { value: 'vit_vellore', label: 'Vellore Institute of Technology' },
        { value: 'vit_bhopal', label: 'Vellore Institute of Technology Bhopal' },
        { value: 'vit_chennai', label: 'Vellore Institute of Technology Chennai' },
        { value: 'vit_bhubaneswar', label: 'Vellore Institute of Technology Bhubaneswar' },
        { value: 'custom', label: 'Other (Specify)' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'collegeName') {
            const selectedCollege = colleges.find(college => college.value === value);
            setFormData(prev => ({ ...prev, [name]: selectedCollege ? selectedCollege.label : value }));
        } else if (name === 'phone') {
            // Remove all whitespace and non-digit characters from phone number
            const cleanPhoneNumber = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanPhoneNumber }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        // Role validation
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }
        
        // College name validation
        if (!formData.collegeName.trim()) {
            newErrors.collegeName = 'College name is required';
        }
        
        // Branch validation
        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
        } else if (formData.branch === 'custom' && !formData.otherBranch.trim()) {
            newErrors.otherBranch = 'Please specify your branch';
        }
        
        // Study type validation - only for students
        if (formData.role === 'student' && !formData.studyType) {
            newErrors.studyType = 'Type of study is required';
        }
        
        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsLoading(true);
        try {
            const existingUserData = JSON.parse(localStorage.getItem("userData") || "{}");
            
            const formattedBranch = formData.branch === 'custom' 
                ? formData.otherBranch.toLowerCase().replace(/\s+/g, '_')
                : formData.branch;

            const updatedUserData1 = {
                uid: existingUserData.uid,
                email: existingUserData.email,
                displayName: existingUserData.displayName,
                collegeName: formData.collegeName.trim(),
                branch: formattedBranch,
                role: formData.role
            };

            const updatedUserData = {
                uid: existingUserData.uid,
                email: existingUserData.email,
                displayName: existingUserData.displayName,
                collegeName: formData.collegeName.trim(),
                role: formData.role,
                branch: formattedBranch,
                studyType: formData.role === 'faculty' ? '--faculty' : formData.studyType,
                phone: formData.phone,
                gender: formData.gender
            };
            
            localStorage.setItem("userData", JSON.stringify(updatedUserData1));
            localStorage.setItem("profileCompleted", "true");
            localStorage.removeItem("fromSignup");
            
            await userService.saveUserProfile(existingUserData.uid, updatedUserData);
            
            dispatch(updateProfileCompletion(true));
            
            toast.success('Profile information saved successfully!');
            
            // Always navigate to home after profile completion
            navigate('/home', { replace: true });
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile information');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-6">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-300 mb-2">Complete Your Profile</h1>
                        <p className="text-gray-600 dark:text-gray-300">Please provide your academic information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Role */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                    errors.role ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <option value="">Select your role</option>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.role}</p>
                            )}
                        </div>

                        {/* College Name */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <select
                                name="collegeName"
                                value={colleges.find(college => college.label === formData.collegeName)?.value || ''}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                    errors.collegeName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <option value="">Select your college</option>
                                {colleges.map(college => (
                                    <option key={college.value} value={college.value}>
                                        {college.label}
                                    </option>
                                ))}
                            </select>
                            {errors.collegeName && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.collegeName}</p>
                            )}
                        </div>

                        {/* Other College Input */}
                        {formData.collegeName === 'Other (Specify)' && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                                <input
                                    type="text"
                                    name="otherCollege"
                                    value={formData.otherCollege || ''}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                        errors.otherCollege ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Enter your college name"
                                />
                                {errors.otherCollege && (
                                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.otherCollege}</p>
                                )}
                            </div>
                        )}

                        {/* Branch */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <GraduationCap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                    errors.branch ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <option value="">Select your branch</option>
                                {branches.map(branch => (
                                    <option key={branch.value} value={branch.value}>
                                        {branch.label}
                                    </option>
                                ))}
                            </select>
                            {errors.branch && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.branch}</p>
                            )}
                        </div>

                        {/* Other Branch Input */}
                        {formData.branch === 'custom' && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <GraduationCap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                                <input
                                    type="text"
                                    name="otherBranch"
                                    value={formData.otherBranch}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                        errors.otherBranch ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    placeholder="Enter your branch name"
                                />
                                {errors.otherBranch && (
                                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.otherBranch}</p>
                                )}
                            </div>
                        )}

                        {/* Study Type */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <GraduationCap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <select
                                name="studyType"
                                value={formData.studyType}
                                onChange={handleChange}
                                disabled={formData.role === 'faculty'}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                    errors.studyType ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                } ${formData.role === 'faculty' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100`}
                            >
                                <option value="">Select type of study</option>
                                {studyTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {errors.studyType && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.studyType}</p>
                            )}
                            {formData.role === 'faculty' && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Study type is not applicable for faculty members</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                    errors.phone ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter your phone number"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.phone}</p>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={`block w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                    errors.gender ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <option value="">Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.gender}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
                                isLoading 
                                    ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed' 
                                    : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800'
                            }`}
                        >
                            {isLoading ? 'Saving...' : 'Save Information'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserInfoForm; 