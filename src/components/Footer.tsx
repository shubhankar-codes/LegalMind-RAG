import { Github, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-slate-100">
                AI Constitution
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Your First Lawyer - Empowering citizens with accessible legal knowledge through AI.
              Understanding your constitutional rights should be simple and free.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#contact" className="text-slate-400 hover:text-blue-300 transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Connect</h3>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-slate-400 hover:text-blue-300 transition-colors text-sm"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <p className="text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} AI Constitution. Built for Citizens of India.
          </p>
          <p className="text-center text-slate-500 text-xs mt-2">
            This is an informational tool. Not a replacement for a licensed advocate.
          </p>
        </div>
      </div>
    </footer>
  );
}
