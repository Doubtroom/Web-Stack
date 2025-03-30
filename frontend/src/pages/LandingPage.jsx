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
        <Navitem link={`/contactus`} text="Contact Us" />
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

// Hero Text Component
const HeroText = () => {
  return (
    <div className="max-w-2xl px-4 sm:px-0">
      <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-light leading-tight mb-6">
        Changing the world, by <span className="text-teal-300">helping People</span>
      </h1>
      <p className="text-white text-base sm:text-lg">
        A journey of learning, growing and building together. All of it, starts in a room. Doubt room. Join us in building dreams by solving the problems of the world. One thing at a time.
      </p>
    </div>
  );
};

// Search Bar Component
const SearchBar = () => {
  return (
    <div className="relative max-w-md w-full px-4 sm:px-0">
      <input
        type="text"
        placeholder="Ask a question..."
        className="w-full py-3 px-6 pr-12 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white placeholder-white outline-none"
      />
      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full">
        <Link to='/login'>
          <Search size={24} />
        </Link>
      </button>
    </div>
  );
};

// Social Link Component
const SocialLink = ({ icon, platform, username }) => {
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
  );
};

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
        <Link to={'/login'}>
          <button className="bg-teal-600 text-white py-2 sm:py-3 px-6 sm:px-10 rounded-md hover:bg-teal-700 transition-colors text-sm sm:text-base">
            Login
          </button>
        </Link>
      </div>
    </footer>
  );
};

const DoubtRoomPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" 
         style={{
           backgroundImage: 'linear-gradient(to right, #1e3c72, #2a5298, #2e6f95, #00a4b4)',
           backgroundSize: 'cover',
         }}>
      {/* Stars overlay */}
      <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/bring-night-space-wallpaper-with-glowing-starfield_1017-53512.jpg?t=st=1742755566~exp=1742759166~hmac=71b72cf058b09914b7031c9e28266fb0fab9f2112e039f721df2b18dbe9cd210&w=1800')] opacity-30 pointer-events-none" />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <NavBar />
        
        <div className="flex-1 flex flex-col md:flex-row justify-between items-center px-4 sm:px-8 py-8 md:py-0 space-y-8 md:space-y-0">
          <HeroText />
          <SearchBar />
        </div>
                
        <Footer />
      </div>
    </div>
  );
};

export default DoubtRoomPage;