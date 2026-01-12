import React from 'react';
import LoginForm from '../../components/LoginForm';
import { Wallet, Shield, Zap } from 'lucide-react';

const LoginPage = () => {
  console.log("Rendering LoginPage");
  return (
    <div className="flex w-full min-h-[calc(100vh-140px)]">
      {/* Left Side - Minimal Brand Section */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 lg:flex lg:flex-col lg:justify-between rounded-r-3xl my-4 ml-4 p-12">
        
        {/* Top Section - Logo & Tagline */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/20 blur-xl rounded-full"></div>
              <div className="relative p-2.5 bg-indigo-600 rounded-2xl shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Ledger<span className="text-indigo-600">X</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
            Welcome back to<br />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              smarter finances
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-md leading-relaxed">
            Continue managing your business with clarity and confidence.
          </p>
        </div>

        {/* Middle Section - Feature Highlights */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Secure & Private</h3>
              <p className="text-sm text-slate-600">Your data is encrypted and protected</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 group">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Lightning Fast</h3>
              <p className="text-sm text-slate-600">Optimized for speed and efficiency</p>
            </div>
          </div>
        </div>



        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                           linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">Sign in</h2>
            <p className="mt-2 text-slate-600">Enter your credentials to continue</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
