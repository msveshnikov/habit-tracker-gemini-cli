import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Habit Tracker</h3>
            <p className="text-gray-400 text-sm">
              Build better habits, one day at a time
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex space-x-4">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#support"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Support
              </a>
            </div>

            <div className="text-gray-400 text-sm">
              © {currentYear} Habit Tracker. All rights reserved.
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-2 md:mb-0">
              Track your progress • Build consistency • Achieve your goals
            </div>

            <div className="flex items-center space-x-4">
              <span>Made with ❤️ for better habits</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
