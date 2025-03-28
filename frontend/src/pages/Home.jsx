import React from 'react'
import Card from '../components/Card'
import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
    
  return (
      <div>
        <div className='mt-32 flex flex-col justify-center items-center'>
            <div className="flex items-center gap-2 mb-4">
              <h2 className='text-2xl font-semibold font-custom-font1'>Most recent Queries</h2>
            </div>
            <div className='border border-t-2 border-blue-800 w-1/2' />
        </div>

        {/* Ask Question Tab */}

        <Link to='/ask-question'>
        <div className="max-w-5xl mx-auto mt-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Have a doubt? Ask here</h3>
                  <p className="text-sm text-gray-500">Get help from the community</p>
                </div>
              </div>
              <div className="text-blue-600 font-medium">Ask Question →</div>
            </div>
          </div>
        </div>
        </Link>


        <section className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 mb-5">
        <Card
          collegeName="IIT Bombay"
          img="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          branch="Computer Science"
          collegeYear="2023"
          topic="How to implement a binary search tree in Python?"
          noOfAnswers={5}
          postedOn="2 hours ago"
        />
        </section>
    </div>
  )
}

export default Home