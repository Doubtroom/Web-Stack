import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useSelector } from 'react-redux';

function Footer({classNames}) {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  return (
    <footer className={`${
      isDarkMode 
        ? 'bg-slate-900 border-t border-slate-800' 
        : 'bg-gradient-to-r from-[#1e6eab] to-[#02254b]'
    } shadow-sm text-white py-10 ${classNames}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-start">
          
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Doubtroom</h2>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Doubtroom. All rights reserved.
            </p>
          </div>

          {/* Links Section */}
          <div className="w-full md:w-1/3 flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Support</h3>
              <ul>
                <li className="mb-2">
                  <Link to="/profile" className="hover:text-gray-200">
                    Account
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/contact" className="hover:text-gray-200">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/customer-support" className="hover:text-gray-200">
                    Customer Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="w-full md:w-1/4 flex flex-col items-start">
            <h3 className="font-semibold mb-4 text-lg">Follow Us</h3>
            <div className="space-x-4">
                <Link to="https://www.youtube.com/@Doubt_Room" target='_blank' className="hover:text-gray-200">
                  <div className='flex items-center gap-2'>
                  <Youtube/>
                  Youtube
                  </div>
                </Link>
                <Link to="https://www.instagram.com/doubt_room?igsh=eXQxaTUxOTdiZDRz" target='_blank' className="hover:text-gray-200">
                    <div className='flex items-center gap-2'>
                    <Instagram />
                    Instagram
                    </div>
                </Link>
                <Link to="https://www.linkedin.com/company/doubt-room" target='_blank' className="hover:text-gray-200">
                    <div className='flex items-center gap-2'>
                    <Linkedin/>
                    LinkedIn
                    </div>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
