import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Mail, ArrowLeft, Wallet, Loader2 } from 'lucide-react';
import { useForgotPassword } from '../../hooks/auth/useForgotPassword';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const { mutate, isLoading } = useForgotPassword();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  // Schema
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
  });

  const onSubmit = (values) => {
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    mutate({ ...values, recaptchaToken }, {
      onSettled: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken(null);
        }
        setSubmitted(true);
      }
    });
  };

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)]">
        {/* Left Side - Brand Section */}
        <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 lg:flex lg:flex-col lg:justify-between rounded-r-3xl my-4 ml-4 p-12">
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
                    Account Recovery
                </h1>
                <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                    Don't worry, we'll help you get back to managing your finances securely.
                </p>
            </div>
             {/* Subtle Background Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl"></div>
        </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
            <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
            </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Forgot Password?</h2>
            <p className="mt-2 text-slate-600">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
            {submitted && !isLoading ? (
                <div className="text-center p-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
                    <p className="text-slate-600">If an account exists for that email, we have sent password reset instructions.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium">Try another email</button>
                </div>
            ) : (
                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                <Form className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute text-slate-400 left-4 top-3.5" size={20} />
                            <Field
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-sm text-red-500 mt-1" />
                    </div>

                    <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                        onChange={onRecaptchaChange}
                        onExpired={() => setRecaptchaToken(null)}
                    />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !recaptchaToken}
                        className="flex items-center justify-center w-full px-4 py-3.5 font-bold text-white transition-all transform bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending Link...
                        </>
                    ) : 'Send Reset Link'}
                    </button>
                </Form>
                </Formik>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
