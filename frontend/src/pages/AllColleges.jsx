import React, { useEffect, useState } from 'react'
import CollegeCard from '../components/CollegeCard'
import { Building2, MessageSquare,Grid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'
import DataService from '../firebase/DataService'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/Button';

const AllColleges = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const dataService = new DataService('questions');
        const questionsData = await dataService.getAllDocuments();
        setQuestions(questionsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatText = (text) => {
    if (!text) return 'Question';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="max-w-7xl mx-auto px-4">

      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Grid className="w-8 h-8 text-[#173f67] dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-[#173f67] dark:text-white">
              All Colleges Questions
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/ask-question')}
          >
            Ask New Question
          </Button>
        </div>

      {/* Questions Grid */}
      <section className="max-w-7xl mx-auto py-10 ">
        {questions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-1 mr-1">
            {questions.map((question) => (
              <CollegeCard
                key={question.id}
                id={question.id}
                collegeName={formatText(question.collegeName) || 'Question'}
                img={question.photo || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                branch={formatText(question.branch) || 'Question'}
                collegeYear="2023"
                topic={formatText(question.topic) || 'General'}
                noOfAnswers={question.answers || 0}
                postedOn={formatTimeAgo(question.createdAt)}
              />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  )
}

export default AllColleges 