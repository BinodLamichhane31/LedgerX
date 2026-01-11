import React from 'react';
import LoginForm from '../../components/LoginForm';
import { Sparkles } from 'lucide-react';

const LoginPage = () => {
  console.log("Rendering LoginPage");
  return (
    <div className="flex w-full min-h-[calc(100vh-140px)]">
      {/* Left Side - Brand/Image */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:block rounded-r-3xl my-4 ml-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-secondary-600/20 mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white text-center">
            <div className="flex items-center gap-2 mb-8">
               <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                 <Sparkles className="w-8 h-8 text-indigo-400" />
               </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-6">LedgerX</h1>
            <p className="text-lg text-slate-300 max-w-md">
              The smartest way to manage your business finances, inventory, and growth.
            </p>
        </div>
        {/* Decorative Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-600">Please enter your details to sign in.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
