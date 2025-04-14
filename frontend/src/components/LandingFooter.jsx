import { Instagram, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SocialLink = ({ icon, username, platform, link }) => {
    return (
      <Link to={link} target="_blank" className="group cursor-pointer">
        <div className="flex items-center space-x-3 sm:space-x-4 transition-all duration-300 hover:scale-105">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:border-teal-400 group-hover:bg-teal-400/10 group-hover:shadow-lg group-hover:shadow-teal-400/20 transition-all duration-300">
            <div className="group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
          <div className="text-white">
            <p className="text-xs sm:text-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300">{platform}</p>
            <p className="font-medium text-xs sm:text-base group-hover:text-teal-400 transition-colors duration-300">{username}</p>
          </div>
        </div>
      </Link>
    )
  }

const Footer = () => {
    return (
      <footer className="w-full border-t border-white/20 py-4 bg-gradient-to-b from-transparent to-[#0a192f]/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-12">
              <SocialLink 
                icon={<Instagram size={18} className="sm:w-5 sm:h-5" />} 
                platform="Join US" 
                username="Instagram"
                link="https://www.instagram.com/doubt_room?igsh=eXQxaTUxOTdiZDRz"
              />
              <SocialLink 
                icon={<Youtube size={18} className="sm:w-5 sm:h-5" />} 
                platform="Build with us" 
                username="Youtube" 
                link="https://www.youtube.com/@doubtroom"
              />
              <SocialLink 
                icon={<Linkedin size={18} className="sm:w-5 sm:h-5" />} 
                platform="Know us" 
                username="LinkedIN"
                link="https://www.linkedin.com/company/doubt-room"
              />
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="text-white/60 text-xs sm:text-sm">
              © 2024 Doubtroom. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  export default Footer;