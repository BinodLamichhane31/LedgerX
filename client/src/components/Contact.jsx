import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import sendMessageAnimation from '../assets/send_message.json';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlinePaperAirplane } from 'react-icons/hi';

const Contact = () => (
  <section id="contact" className="px-8 py-24 bg-slate-50">
    <div className="max-w-screen-xl mx-auto">
      <div className="grid overflow-hidden bg-white shadow-2xl rounded-3xl lg:grid-cols-2">
        
        {/* Contact Info (Dark Side) */}
        <div className="relative p-10 text-white bg-slate-900 sm:p-12 lg:p-16">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
            >
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-heading">Let's Talk Business</h2>
                <p className="mt-4 text-lg text-slate-300">
                  Ready to optimize your financial workflow? Our team is ready to help you set up Ledger X for your specific needs.
                </p>
                
                <dl className="mt-12 space-y-8">
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
                        <HiOutlinePhone className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Phone</dt>
                        <dd className="text-lg font-semibold">+977 98XXXXXXXX</dd>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
                        <HiOutlineMail className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Email</dt>
                        <dd className="text-lg font-semibold">hello@ledgerx.com</dd>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm">
                        <HiOutlineLocationMarker className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Office</dt>
                        <dd className="text-lg font-semibold">Kathmandu, Nepal</dd>
                    </div>
                  </div>
                </dl>
            </motion.div>
        </div>

        {/* Contact Form (Light Side) */}
        <div className="p-10 bg-white sm:p-12 lg:p-16">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-slate-900">Send us a message</h3>
             <form className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" id="name" className="block w-full px-4 py-3 mt-2 transition-colors border-0 rounded-lg bg-slate-50 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="John Doe" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                    <input type="tel" id="phone" className="block w-full px-4 py-3 mt-2 transition-colors border-0 rounded-lg bg-slate-50 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="+977..." />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" id="email" className="block w-full px-4 py-3 mt-2 transition-colors border-0 rounded-lg bg-slate-50 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                <textarea id="message" rows={4} className="block w-full px-4 py-3 mt-2 transition-colors border-0 rounded-lg bg-slate-50 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="How can we help you?"></textarea>
              </div>
              
              <button className="inline-flex items-center justify-center w-full gap-2 px-8 py-4 font-bold text-white transition-all transform bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-500/30">
                <span>Send Message</span>
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;