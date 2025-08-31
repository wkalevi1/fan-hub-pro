import React from 'react';
import { Crown, Menu } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/30 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Fan Hub Pro
              </h1>
              <p className="text-xs text-amber-700/70 font-medium">StephanieG.co</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="hover:bg-amber-100/50">
            <Menu className="h-5 w-5 text-amber-700" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;