import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Scale className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span className="text-xl font-bold text-slate-100">
              AI Constitution
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-blue-300 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/ask"
              className="text-slate-300 hover:text-blue-300 transition-colors font-medium"
            >
              Ask Question
            </Link>
            <a
              href="#about"
              className="text-slate-300 hover:text-blue-300 transition-colors font-medium"
            >
              About
            </a>
          </nav>

          <Link
            to="/ask"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-all shadow-md hover:shadow-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
