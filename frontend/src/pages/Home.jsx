import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { HelpCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DataService from '../firebase/DataService'

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const dataService = new DataService('questions');
        const fetchedQuestions = await dataService.getAllDocuments();
        // Sort questions by creation date (newest first)
        const sortedQuestions = fetchedQuestions.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setQuestions(sortedQuestions);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
        console.error('Error fetching questions:', err);
      } finally {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className='mt-24 flex flex-col justify-center items-center'>
        <h2 className='text-3xl font-bold text-gray-800 mb-4'>Most Recent Queries</h2>
        <div className='border border-t-2 border-blue-800 w-1/4' />
      </div>

      {/* Ask Question Tab */}
      <Link to='/ask-question'>
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Have a doubt? Ask here</h3>
                  <p className="text-sm text-gray-500 mt-1">Get help from the community</p>
                </div>
              </div>
              <div className="text-blue-600 font-medium flex items-center gap-2">
                Ask Question
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Questions Grid */}
      <section className="max-w-7xl mx-auto py-10 px-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-8 mr-8">
            {questions.map((question) => (
              <Card
                key={question.id}
                collegeName={formatText(question.collegeName) || 'Question'}
                img={question.photo || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                branch={formatText(question.branch) || 'Question'}
                collegeYear="2023"
                topic={question.text || 'Question'}
                noOfAnswers={0}
                postedOn={formatTimeAgo(question.createdAt)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home