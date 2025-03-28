import React from 'react';
import Card from './Card';

const CardExample = () => {
  // Sample data for cards
  const sampleCards = [
    {
      collegeName: "IIT Bombay",
      img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      branch: "Computer Science",
      collegeYear: "2023",
      topic: "How to implement a binary search tree in Python?",
      noOfAnswers: 5,
      postedOn: "2 hours ago"
    },
    {
      collegeName: "NIT Trichy",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      branch: "Electronics Engineering",
      collegeYear: "2023",
      topic: "Understanding MOSFET operation and characteristics",
      noOfAnswers: 3,
      postedOn: "5 hours ago"
    },
    {
      collegeName: "BITS Pilani",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      branch: "Mechanical Engineering",
      collegeYear: "2023",
      topic: "Help needed with thermodynamics problem - Carnot cycle",
      noOfAnswers: 8,
      postedOn: "1 day ago"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Recent Questions</h1>
      
      {/* Grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCards.map((card, index) => (
          <Card
            key={index}
            collegeName={card.collegeName}
            img={card.img}
            branch={card.branch}
            collegeYear={card.collegeYear}
            topic={card.topic}
            noOfAnswers={card.noOfAnswers}
            postedOn={card.postedOn}
          />
        ))}
      </div>
    </div>
  );
};

export default CardExample; 