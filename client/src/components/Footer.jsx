import React from 'react';

import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => (
  <footer id="footer" className="pt-20 pb-10 text-slate-400 bg-slate-950 px-8 sm:px-16">
    <div className="max-w-screen-xl mx-auto">
      <div className="grid gap-12 md:grid-cols-4 lg:gap-16">
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-1 text-white">
                <span className="text-2xl font-extrabold tracking-tight">Ledger<span className="text-indigo-500">X</span></span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Empowering businesses with intelligent financial tools. Simple, secure, and scalable.
              </p>
          </div>
          <div className="mt-6 flex gap-4">
             <a href="#" className="p-2 transition-colors rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><FaFacebook size={18} /></a>
             <a href="#" className="p-2 transition-colors rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><FaTwitter size={18} /></a>
             <a href="#" className="p-2 transition-colors rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><FaInstagram size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white tracking-wide uppercase text-xs">Product</h4>
          <ul className="mt-6 space-y-4 text-sm">
            <li><a href="#features" className="transition-colors hover:text-indigo-400">Features</a></li>
            <li><a href="#pricing" className="transition-colors hover:text-indigo-400">Pricing</a></li>
            <li><a href="#testimonials" className="transition-colors hover:text-indigo-400">Testimonials</a></li>
            <li><a href="#faq" className="transition-colors hover:text-indigo-400">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white tracking-wide uppercase text-xs">Company</h4>
          <ul className="mt-6 space-y-4 text-sm">
            <li><a href="#about" className="transition-colors hover:text-indigo-400">About Us</a></li>
            <li><a href="#careers" className="transition-colors hover:text-indigo-400">Careers</a></li>
            <li><a href="#blog" className="transition-colors hover:text-indigo-400">Blog</a></li>
            <li><a href="#contact" className="transition-colors hover:text-indigo-400">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-white tracking-wide uppercase text-xs">Legal</h4>
          <ul className="mt-6 space-y-4 text-sm">
            <li><a href="#" className="transition-colors hover:text-indigo-400">Privacy Policy</a></li>
            <li><a href="#" className="transition-colors hover:text-indigo-400">Terms of Service</a></li>
            <li><a href="#" className="transition-colors hover:text-indigo-400">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 mt-16 text-xs text-center border-t border-slate-800/50 text-slate-600">
        <p>© {new Date().getFullYear()} Ledger X. All rights reserved. Made with ❤️ in Nepal 🇳🇵</p>
      </div>
    </div>
  </footer>
);

export default Footer;