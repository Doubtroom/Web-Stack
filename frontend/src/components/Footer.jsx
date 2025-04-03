import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSelector } from 'react-redux';

function Footer({classNames}) {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  return (
    <footer className={`${
      isDarkMode 
        ? 'bg-slate-900 border-t border-slate-800' 
        : 'bg-gradient-to-r from-[#173f67] to-[#0f2942]'
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
            <div className="mb-6 md:mb-0">
              <h3 className="font-semibold mb-4 text-lg">Company</h3>
              <ul>
                <li className="mb-2">
                  <Link target='_blank' to="/features" className="hover:text-gray-200">
                    Features
                  </Link>
                </li>
                <li className="mb-2">
                  <Link target='_blank' to="/pricing" className="hover:text-gray-200">
                    Pricing
                  </Link>
                </li>
                <li className="mb-2">
                  <Link target='_blank' to="/affiliate" className="hover:text-gray-200">
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link target='_blank' to="/press" className="hover:text-gray-200">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Support</h3>
              <ul>
                <li className="mb-2">
                  <Link to="/profile" className="hover:text-gray-200">
                    Account
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/help" className="hover:text-gray-200">
                    Help
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/contact" className="hover:text-gray-200">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-gray-200">
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
                <Link to="#" className="hover:text-gray-200">
                    <Facebook />
                </Link>
                <Link to="#" className="hover:text-gray-200">
                    <Twitter/>
                </Link>
                <Link to="#" className="hover:text-gray-200">
                    <Instagram />
                </Link>
                <Link to="#" className="hover:text-gray-200">
                    <Linkedin/>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
