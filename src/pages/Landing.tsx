import { Link } from 'react-router-dom';
import { MessageSquare, Shield, Lock, Search, FileText, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-100 leading-tight">
            Know Your Rights.{' '}
            <span className="text-blue-400">Instantly.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AI Constitution explains your legal rights in simple language.
          </p>
          <div className="pt-4">
            <Link to="/ask">
              <Button className="text-lg px-8 py-4">
                Ask Your Legal Question
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-400 pt-4">
            <div className="flex items-center space-x-1">
              <Lock className="h-4 w-4" />
              <span>Data Not Stored Without Consent</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Built for Citizens of India</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">
          Why Choose AI Constitution?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hover>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-slate-800 p-4 rounded-full">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">
                Easy Language Explanation
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Complex legal jargon translated into simple, everyday language that anyone can understand.
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-slate-800 p-4 rounded-full">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">
                Constitution-based Answers
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Every answer is backed by relevant Constitutional articles and legal provisions.
              </p>
            </div>
          </Card>

          <Card hover>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-slate-800 p-4 rounded-full">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">
                Privacy Protected
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Your questions are processed securely. Data is only stored with your explicit consent.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div className="bg-slate-800 p-4 rounded-full">
              <Search className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">
              Ask Your Question
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Type your legal question in plain language. No legal expertise required.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div className="bg-slate-800 p-4 rounded-full">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">
              AI Analyzes Constitutional Provisions
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Our AI examines relevant Constitutional articles and legal precedents.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div className="bg-slate-800 p-4 rounded-full">
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">
              Get Simplified Explanation
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Receive clear guidance with practical advice and next steps.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-amber-950/30 border-y border-amber-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-amber-100 mb-2">
                Important Disclaimer
              </h3>
              <p className="text-amber-200/90 leading-relaxed">
                AI Constitution is an informational tool designed to help you understand your legal rights.
                The information provided is generated by AI and should not be considered as professional legal advice.
                For specific legal matters, always consult with a licensed advocate or legal professional.
                This tool is not a replacement for professional legal counsel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-8 md:p-12 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8" />
            <h3 className="text-2xl font-bold">Powered by Gemini 2.5 Flash</h3>
          </div>
          <p className="text-lg leading-relaxed mb-6">
            Our AI legal assistant uses Google's Gemini 2.5 Flash model via OpenRouter for
            intelligent analysis of constitutional provisions and legal rights. This cutting-edge AI
            provides rapid, accurate responses while maintaining complete data privacy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">Fast Response Time</h4>
              <p className="text-blue-50">Instant analysis of your legal questions</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">Accurate Analysis</h4>
              <p className="text-blue-50">Referenced to constitutional provisions</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-100 mb-2">Privacy First</h4>
              <p className="text-blue-50">Your data is never stored without consent</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-6">
          Ready to Understand Your Rights?
        </h2>
        <p className="text-xl text-slate-300 mb-8">
          Start by asking your legal question today. Get instant constitutional analysis powered by AI.
        </p>
        <Link to="/ask">
          <Button className="text-lg px-8 py-4">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
