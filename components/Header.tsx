import React from 'react';

const Header: React.FC = () => (
  <header className="bg-gray-800 shadow-lg">
    <div className="container mx-auto px-4 py-6 relative flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Banana & Veo Gen
        </h1>
        <p className="text-md text-gray-400 mt-2">
          AI ဖြင့် ပုံများနှင့် ဗီဒီယိုများ ဖန်တီးရန်
        </p>
      </div>
    </div>
  </header>
);

export default Header;
