import React from 'react';

const Header = () => {
  const primaryColor = "rgb(153, 214, 220)";
  const styles = {
    textPrimary: { color: primaryColor },
  };

  return (
    <header className="bg-white border-b shadow-sm w-full">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="font-bold text-xl" style={styles.textPrimary}>TAIGA</span>
            </div>
            <div className="ml-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Projects</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="h-8 w-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <span className="text-sm font-medium">U</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 