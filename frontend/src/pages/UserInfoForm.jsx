import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, Phone, User, Briefcase, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import userService from '../firebase/UserService';
import { useDispatch } from 'react-redux';
import { updateProfileCompletion } from '../redux/profileSlice';

const UserInfoForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        collegeName: '',
        otherCollege: '',
        branch: '',
        otherBranch: '',
        studyType: '',
        phone: '',
        gender: '',
        role: '',
        dob: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [dobInput, setDobInput] = useState({
        day: '',
        month: '',
        year: ''
    });
    const [dobCursor, setDobCursor] = useState(0);
    
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
        { value: 'btech', label: "Bachelor's Degree (B.Tech)" },
        { value: 'bs_ms', label: "Bachelor's + Master's Degree (B.S - M.S / BS - MS / B.Tech - M.Tech / BT - MT)" },
        { value: 'mtech', label: "Master's Degree (M.Tech)" },
        { value: 'msc', label: "Master's Degree (M.Sc.)" },
        { value: 'mba', label: "Master's Degree (MBA)" },
        { value: 'phd', label: "Doctorate (Ph.D.)" }
      ];
      

      const branches = [
        { value: 'biotechnology_biochemical_engineering', label: 'Biotechnology & Biochemical Engineering' },
        { value: 'chemical_engineering', label: 'Chemical Engineering' },
        { value: 'civil_engineering', label: 'Civil Engineering' },
        { value: 'structural_engineering', label: 'Structural Engineering' },
        { value: 'geo_technical_engineering', label: 'Geo-technical Engineering' },
        { value: 'transportation_engineering', label: 'Transportation Engineering' },
        { value: 'environmental_engineering', label: 'Environmental Engineering' },
        { value: 'water_resources_engineering', label: 'Water Resources Engineering' },
        { value: 'hydroinformatics_engineering', label: 'Hydroinformatics Engineering' },
        { value: 'seismic_science_engineering', label: 'Seismic Science and Engineering' },
        { value: 'computer_science_engineering', label: 'Computer Science & Engineering' },
        { value: 'artificial_intelligence', label: 'Artificial Intelligence' },
        { value: 'cyber_security', label: 'Cyber Security' },
        { value: 'data_science_engineering', label: 'Data Science and Engineering' },
        { value: 'electrical_engineering', label: 'Electrical Engineering' },
        { value: 'power_electronics_drives', label: 'Power Electronics & Drives' },
        { value: 'power_system_engineering', label: 'Power System Engineering' },
        { value: 'instrumentation_engineering', label: 'Instrumentation Engineering' },
        { value: 'integrated_energy_system', label: 'Integrated Energy System' },
        { value: 'electronics_instrumentation_engineering', label: 'Electronics And Instrumentation Engineering' },
        { value: 'electronics_communication_engineering', label: 'Electronics and Communication Engineering' },
        { value: 'communication_signal_processing', label: 'Communication Systems & Signal Processing' },
        { value: 'vlsi_design', label: 'VLSI Design' },
        { value: 'mechanical_engineering', label: 'Mechanical Engineering' },
        { value: 'material_science_engineering', label: 'Material Science and Engineering' },
        { value: 'thermal_science_engineering', label: 'Thermal Science and Engineering' },
        { value: 'manufacturing_technology', label: 'Manufacturing Technology' },
        { value: 'automotive_engineering', label: 'Automotive Engineering' },
        { value: 'machine_design', label: 'Machine Design' },
        { value: 'production_engineering', label: 'Production Engineering' },
        { value: 'computer_integrated_manufacturing', label: 'Computer Integrated Manufacturing' },
        { value: 'humanities_social_sciences_management', label: 'Humanities & Social Sciences and Management' },
        { value: 'physics', label: 'Physics' },
        { value: 'engineering_physics', label: 'Engineering Physics' },
        { value: 'chemistry', label: 'Chemistry' },
        { value: 'mathematics_computing', label: 'Mathematics and Computing' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'computational_mathematics', label: 'Computational Mathematics' }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        let formattedDate = value;
        
        // If it's a date input, format it properly
        if (e.target.type === 'date') {
            formattedDate = formatDate(value);
        } else {
            // For text input, validate and format as user types
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length > 0) {
                const year = cleaned.slice(0, 4);
                const month = cleaned.slice(4, 6);
                const day = cleaned.slice(6, 8);
                
                if (cleaned.length <= 4) {
                    formattedDate = year;
                } else if (cleaned.length <= 6) {
                    formattedDate = `${year}-${month}`;
                } else {
                    formattedDate = `${year}-${month}-${day}`;
                }
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: formattedDate }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateDate = (dateString) => {
        if (!dateString) return 'Date of Birth is required';
        
        const date = new Date(dateString);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 100);
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 13);

        if (isNaN(date.getTime())) return 'Please enter a valid date';
        if (date < minDate || date > maxDate) {
            return 'Please enter a valid date of birth (between 13 and 100 years)';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'collegeName') {
            if (value === 'custom') {
                setFormData(prev => ({ ...prev, [name]: 'Other (Specify)' }));
            } else {
                const selectedCollege = colleges.find(college => college.value === value);
                setFormData(prev => ({ ...prev, [name]: selectedCollege ? selectedCollege.label : value }));
            }
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
        
        // Phone validation - now optional
        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        // DOB validation
        const dobError = validateDate(formData.dob);
        if (dobError) {
            newErrors.dob = dobError;
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

            // Get the college name based on selection
            let collegeName;
            if (formData.collegeName === 'Other (Specify)') {
                collegeName = formData.otherCollege.trim();
            } else {
                collegeName = formData.collegeName.trim();
            }

            const updatedUserData = {
                uid: existingUserData.uid,
                email: existingUserData.email,
                displayName: existingUserData.displayName,
                collegeName: collegeName,
                role: formData.role,
                branch: formattedBranch,
                studyType: formData.role === 'faculty' ? '--faculty' : formData.studyType,
                phone: formData.phone || null,
                gender: formData.gender,
                dob: formData.dob
            };
            
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
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

    const handleDobKeyDown = (e) => {
        const { key } = e;
        const currentValue = dobInput;
        const cursor = dobCursor;

        // Allow navigation keys
        if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Tab'].includes(key)) {
            if (key === 'ArrowLeft' && cursor > 0) {
                setDobCursor(cursor - 1);
            } else if (key === 'ArrowRight' && cursor < 10) {
                setDobCursor(cursor + 1);
            } else if (key === 'Backspace' && cursor > 0) {
                const newValue = currentValue.split('');
                if (newValue[cursor - 1] !== '/') {
                    newValue[cursor - 1] = '-';
                    setDobInput(newValue.join(''));
                    setDobCursor(cursor - 1);
                } else {
                    setDobCursor(cursor - 1);
                }
            } else if (key === 'Delete' && cursor < 10) {
                const newValue = currentValue.split('');
                if (newValue[cursor] !== '/') {
                    newValue[cursor] = '-';
                    setDobInput(newValue.join(''));
                }
            }
            return;
        }

        // Only allow numbers
        if (!/^\d$/.test(key)) {
            e.preventDefault();
            return;
        }

        // Handle number input
        const newValue = currentValue.split('');
        if (cursor < 10) {
            if (cursor === 2 || cursor === 5) {
                setDobCursor(cursor + 1);
            }
            if (newValue[cursor] !== '/') {
                newValue[cursor] = key;
                setDobInput(newValue.join(''));
                setDobCursor(cursor + 1);
            }
        }
    };

    const handleDobChange = (e) => {
        const { name, value } = e.target;
        // Only allow numbers
        const numericValue = value.replace(/\D/g, '');
        
        // Set max lengths and validate
        if (name === 'day' && numericValue.length <= 2) {
            setDobInput(prev => ({ ...prev, [name]: numericValue }));
        } else if (name === 'month' && numericValue.length <= 2) {
            setDobInput(prev => ({ ...prev, [name]: numericValue }));
        } else if (name === 'year' && numericValue.length <= 4) {
            setDobInput(prev => ({ ...prev, [name]: numericValue }));
        }

        // Update form data when all fields are filled
        if (dobInput.day.length === 2 && dobInput.month.length === 2 && dobInput.year.length === 4) {
            const formattedDate = `${dobInput.day}-${dobInput.month}-${dobInput.year}`;
            setFormData(prev => ({ ...prev, dob: formattedDate }));
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

                        {/* Phone Number - now optional */}
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
                                placeholder="Enter your phone number (optional)"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.phone}</p>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date of Birth
                            </label>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        name="day"
                                        value={dobInput.day}
                                        onChange={handleDobChange}
                                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            errors.dob ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="DD"
                                        maxLength={2}
                                    />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">/</span>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        name="month"
                                        value={dobInput.month}
                                        onChange={handleDobChange}
                                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            errors.dob ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="MM"
                                        maxLength={2}
                                    />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">/</span>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        name="year"
                                        value={dobInput.year}
                                        onChange={handleDobChange}
                                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            errors.dob ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="YYYY"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                            {errors.dob && (
                                <p className="text-sm text-red-500 dark:text-red-400">{errors.dob}</p>
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