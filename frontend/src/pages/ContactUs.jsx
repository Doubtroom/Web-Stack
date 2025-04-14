import React, { useState } from 'react';
import { Mail, Linkedin, Instagram, MessageSquare } from 'lucide-react';
import DataService from '../firebase/DataService';
import { toast } from 'sonner';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
        
        const dataService = new DataService('customerCare');
        await dataService.sendCustomerSupportQuery(formData);
        toast.success('Your message has been sent successfully!');
      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.'
      });
      
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      icon: <Mail className="w-6 h-6 text-black dark:text-white" />,
      label: 'Email',
      value: 'doubtroomteam@gmail.com',
      link: 'mailto:doubtroomteam@gmail.com',
      color: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      icon: <Linkedin className="w-6 h-6 text-black dark:text-white" />,
      label: 'LinkedIn',
      value: 'Doubtroom',
      link: 'https://linkedin.com/company/doubt-room',
      color: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: <Instagram className="w-6 h-6 text-black dark:text-white" />,
      label: 'Instagram',
      value: '@doubtroom',
      link: 'https://www.instagram.com/doubt_room?igsh=eXQxaTUxOTdiZDRz',
      color: 'bg-pink-100 dark:bg-pink-900/30'
    }
  ];

  return (
    <div className="min-h-screen  bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 lg:py-5 px-4 lg:mt-14">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            <div className="space-y-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-4 p-4 rounded-lg ${social.color} hover:shadow-md transition-all duration-300`}
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                    {social.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{social.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{social.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your message..."
                ></textarea>
              </div>
              {submitStatus && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  {submitStatus.message}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12  text-center">
          <p className="text-gray-600 dark:text-gray-300">
            We typically respond within 3-4 business days. For urgent matters, please reach out to us directly via email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 