import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Phone,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/authSlice.js";
import apiClient from "../services/api.client.js";
import { motion } from "framer-motion";
import { imageLinks } from "../config/assetConfig.js";

const UserInfoForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [formData, setFormData] = useState({
    collegeName: "",
    otherCollege: "",
    branch: "",
    otherBranch: "",
    studyType: "",
    phone: "",
    gender: "",
    role: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDataLoading, setIsFormDataLoading] = useState(true);
  const [dobInput, setDobInput] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [studyTypes, setStudyTypes] = useState([]);

  const fromSignup = localStorage.getItem("fromSignup") === "true";

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsFormDataLoading(true);
        const [collegesRes, branchesRes, studyTypesRes] = await Promise.all([
          apiClient.get("/form-data/colleges"),
          apiClient.get("/form-data/branches"),
          apiClient.get("/form-data/study-types"),
        ]);
        setColleges(collegesRes.data);
        setBranches(branchesRes.data);
        setStudyTypes(studyTypesRes.data);
      } catch (error) {
        console.error("Failed to fetch form data", error);
        toast.error("Failed to load form options. Please try again later.");
      } finally {
        setIsFormDataLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleDobChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    // Set max lengths and validate
    if (name === "day" && numericValue.length <= 2) {
      setDobInput((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "month" && numericValue.length <= 2) {
      setDobInput((prev) => ({ ...prev, [name]: numericValue }));
    } else if (name === "year" && numericValue.length <= 4) {
      setDobInput((prev) => ({ ...prev, [name]: numericValue }));
    }

    // Create a new object with updated dobInput
    const updatedDobInput = {
      ...dobInput,
      [name]: numericValue,
    };

    // Update form data when all fields are filled
    if (
      updatedDobInput.day.length === 2 &&
      updatedDobInput.month.length === 2 &&
      updatedDobInput.year.length === 4
    ) {
      // Pad month and day with leading zeros if needed
      const day = updatedDobInput.day.padStart(2, "0");
      const month = updatedDobInput.month.padStart(2, "0");
      const year = updatedDobInput.year;

      const formattedDate = `${year}-${month}-${day}`;
      setFormData((prev) => ({ ...prev, dob: formattedDate }));

      // Validate the date
      const error = validateDate(updatedDobInput);
      if (error) {
        setErrors((prev) => ({ ...prev, dob: error }));
      } else {
        setErrors((prev) => ({ ...prev, dob: "" }));
      }
    } else {
      // Clear the DOB if not all fields are filled
      setFormData((prev) => ({ ...prev, dob: "" }));
      setErrors((prev) => ({ ...prev, dob: "Date of Birth is required" }));
    }
  };

  const validateDate = (dobInput) => {
    const { day, month, year } = dobInput;

    // Check if all fields are filled
    if (
      !day ||
      !month ||
      !year ||
      day.length !== 2 ||
      month.length !== 2 ||
      year.length !== 4
    ) {
      return "Date of Birth is required";
    }

    // Convert to numbers for validation
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Basic validation
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      return "Please enter valid numbers";
    }

    // Validate ranges
    if (dayNum < 1 || dayNum > 31) {
      return "Day must be between 1 and 31";
    }
    if (monthNum < 1 || monthNum > 12) {
      return "Month must be between 1 and 12";
    }
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      return `Year must be between 1900 and ${new Date().getFullYear()}`;
    }

    // Validate specific month days
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum > daysInMonth) {
      return `Invalid day for the selected month`;
    }

    // Check if date is in the future
    const inputDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    if (inputDate > today) {
      return "Date of Birth cannot be in the future";
    }

    // Check if user is at least 13 years old
    const minAge = 13;
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - minAge);
    if (inputDate > minDate) {
      return `You must be at least ${minAge} years old`;
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateDate(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (name === "collegeName") {
      if (value === "custom") {
        setFormData((prev) => ({ ...prev, [name]: "Other (Specify)" }));
      } else {
        const selectedCollege = colleges.find(
          (college) => college.value === value,
        );
        setFormData((prev) => ({
          ...prev,
          [name]: selectedCollege ? selectedCollege.label : value,
        }));
      }
    } else if (name === "phone") {
      // Remove all whitespace and non-digit characters from phone number
      const cleanPhoneNumber = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanPhoneNumber }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // College name validation
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College name is required";
    }

    // Branch validation
    if (!formData.branch) {
      newErrors.branch = "Branch is required";
    } else if (formData.branch === "custom" && !formData.otherBranch.trim()) {
      newErrors.otherBranch = "Please specify your branch";
    }

    // Study type validation - only for students
    if (formData.role === "student" && !formData.studyType) {
      newErrors.studyType = "Type of study is required";
    }

    // Phone validation - now optional
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // DOB validation
    const dobError = validateDate(dobInput);
    if (dobError) {
      newErrors.dob = dobError;
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const formattedBranch =
        formData.branch === "custom"
          ? formData.otherBranch.toLowerCase().replace(/\s+/g, "_")
          : formData.branch;

      // Get the college name based on selection
      let collegeName;
      if (formData.collegeName === "Other (Specify)") {
        collegeName = formData.otherCollege.trim();
      } else {
        collegeName = formData.collegeName.trim();
      }

      const formattedDob = formData.dob ? formData.dob : null;

      // Create updated user data while preserving the uid
      const updatedUserData = {
        collegeName: collegeName,
        role: formData.role,
        branch: formattedBranch,
        studyType:
          formData.role === "faculty" ? "--faculty" : formData.studyType,
        phone: formData.phone || null,
        gender: formData.gender,
        dob: formattedDob,
      };

      await dispatch(updateProfile(updatedUserData));

      toast.success("Profile information saved successfully!");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageLinks.authBackground}
          alt="login bg"
          className="w-full h-full object-cover object-center opacity-60 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-white/60 to-purple-100/40 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-blue-900/60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl p-8 sm:p-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-blue-800"
      >
        <div className="text-center mb-8">
          <h1
            className={`text-3xl font-bold mb-2 drop-shadow-sm ${isDarkMode ? "text-white" : "text-blue-900"}`}
          >
            Complete Your Profile
          </h1>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Please provide your academic information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                errors.role
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="faculty(Phd)">{"Faculty (Phd)"}</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.role}
              </p>
            )}
          </div>

          {/* College Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <select
              name="collegeName"
              value={
                colleges.find(
                  (college) => college.label === formData.collegeName,
                )?.value || ""
              }
              onChange={handleChange}
              disabled={isFormDataLoading}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                errors.collegeName
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">
                {isFormDataLoading
                  ? "Loading colleges..."
                  : "Select your college"}
              </option>
              {colleges.map((college) => (
                <option key={college.value} value={college.value}>
                  {college.label}
                </option>
              ))}
            </select>
            {errors.collegeName && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.collegeName}
              </p>
            )}
          </div>

          {/* Other College Input */}
          {formData.collegeName === "Other (Specify)" && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <input
                type="text"
                name="otherCollege"
                value={formData.otherCollege || ""}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                  errors.otherCollege
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter your college name"
              />
              {errors.otherCollege && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.otherCollege}
                </p>
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
              disabled={isFormDataLoading}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                errors.branch
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">
                {isFormDataLoading
                  ? "Loading branches..."
                  : "Select your branch"}
              </option>
              {branches.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
            {errors.branch && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.branch}
              </p>
            )}
          </div>

          {/* Other Branch Input */}
          {formData.branch === "custom" && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <input
                type="text"
                name="otherBranch"
                value={formData.otherBranch}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                  errors.otherBranch
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter your branch name"
              />
              {errors.otherBranch && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.otherBranch}
                </p>
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
              disabled={formData.role === "faculty" || isFormDataLoading}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.studyType
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              } ${formData.role === "faculty" ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : "bg-white/80 dark:bg-gray-700/80"} text-gray-900 dark:text-gray-100`}
            >
              <option value="">
                {isFormDataLoading ? "Loading..." : "Select type of study"}
              </option>
              {studyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.studyType && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.studyType}
              </p>
            )}
            {formData.role === "faculty" && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Study type is not applicable for faculty members
              </p>
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
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                errors.phone
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter your phone number (optional)"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.phone}
              </p>
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
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                    errors.dob
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
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
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                    errors.dob
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
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
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                    errors.dob
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="YYYY"
                  maxLength={4}
                />
              </div>
            </div>
            {errors.dob && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errors.dob}
              </p>
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
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 ${
                errors.gender
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.gender}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.03] ${
              isLoading
                ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
            }`}
          >
            {isLoading ? "Saving..." : "Save Information"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UserInfoForm;
