import React from 'react';
import { Search, Instagram, Youtube, Linkedin, Menu } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import Logo from '../assets/logoWhite.png';
import { useState } from 'react';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center w-full px-4 sm:px-8 py-4 relative">
      <div className='flex gap-2 items-center align-middle'>
        <div className="w-8 h-8 rounded-md flex items-center justify-center">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white">Doubtroom</div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <Navitem link={`/about`} text="About" />
        <Navitem link={`/login`} text="Log in" />
        <Navitem link={`/signup`} text="Sign up" />
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 w-48 bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg p-4 mt-2 md:hidden">
          <div className="flex flex-col space-y-4">
            <Navitem link={`/about`} text="About" />
            <Navitem link={`/login`} text="Log in" />
            <Navitem link={`/signup`} text="Sign up" />
            <Navitem link={`/contactus`} text="Contact Us" />
          </div>
        </div>
      )}
    </nav>
  );
};

// Reusable Navigation Link
const Navitem = ({ text, active = false, link = "" }) => {
  return (
    <NavLink
      to={`${link}`}
      className={`text-white text-base sm:text-lg hover:opacity-90 transition-opacity ${active ? 'border-b-2 border-white pb-1' : ''}`}
    >
      {text}
    </NavLink>
  );
};

const HeroText = () => {
  return (
    <div className="max-w-2xl px-4 sm:px-0">
      <h1 className="text-white mb-2">
        <span className="block text-4xl sm:text-5xl md:text-6xl font-bold mb-4">At Doubtroom</span>
        <span className="block text-2xl sm:text-3xl md:text-4xl leading-tight font-bold text-teal-300">
          we change the world, by helping people
        </span>
      </h1>
      <p className="text-white text-base sm:text-lg">
        A journey of learning, growing and building together. All of it, starts in a room. Doubt room. Join us in building dreams by solving the problems of the world. One thing at a time.
      </p>
    </div>
  );
};



// Social Link Component
const SocialLink = ({ icon, username }) => {
  return (
    <Link>
      <div className="flex items-center space-x-4 hover:scale-105 transition-transform delay-100 cursor-pointer">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white flex items-center justify-center text-white">
          {icon}
        </div>
        <div className="text-white">
          <p className="text-sm opacity-70">Join US</p>
          <p className="font-medium text-sm sm:text-base">{username}</p>
        </div>
      </div>
    </Link>
  )
}

// Footer Component
const Footer = () => {
  return (
    <footer className="w-full border-t border-white border-opacity-20 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 space-y-4 sm:space-y-0">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-12">
          <SocialLink icon={<Instagram size={20} />} platform="Join US" username="Instagram" />
          <SocialLink icon={<Youtube size={20} />} platform="Build with us" username="Youtube" />
          <SocialLink icon={<Linkedin size={20} />} platform="Know us" username="LinkedIN" />
        </div>
        <Link to={'/signup'}>
          <button className="bg-teal-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-md hover:bg-teal-700 transition-colors text-sm sm:text-base">
            Sign Up
          </button>
        </Link>
      </div>
    </footer>
  );
}

const DoubtRoomPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" 
         style={{
           backgroundImage: 'linear-gradient(to right, #0a192f, #112240, #1a365d, #1e3a8a)',
           backgroundSize: 'cover',
         }}>
      {/* Stars overlay */}
      <div className="absolute inset-0  opacity-30 pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <NavBar />
        
        <div className="flex-1 flex flex-col md:flex-row justify-between items-center px-4 sm:px-8 py-8 md:py-12 gap-8">
          <div className="w-full md:w-1/2">
            <HeroText />
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center">
          <img src="https://doubtroom.sirv.com/Doubtroom/art2.png" className="w-4/5 max-w-md object-contain" alt="art" />
          </div>
        </div>
                
        <Footer />
      </div>
    </div>
  );
};

export default DoubtRoomPage;