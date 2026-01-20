import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Lock, Eye, EyeOff, Wallet } from 'lucide-react';
import { useResetPassword } from '../../hooks/auth/useResetPassword';
import { useParams, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const { mutate, isLoading } = useResetPassword();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Schema
    const validationSchema = Yup.object({
        password: Yup.string()
            .required('Password is required')
            .matches(
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
                "Password must be at least 8 chars, incl. uppercase, lowercase, number, special char"
            ),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const onSubmit = (values) => {
        mutate({ token, password: values.password });
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-slate-600 mb-4">The password reset link is invalid or missing.</p>
                    <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
                </div>
            </div>
        );
    }

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
                    Reset Password
                </h1>
                <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                    Create a strong new password to secure your account.
                </p>
            </div>
             {/* Subtle Background Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl"></div>
        </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">New Password</h2>
            <p className="mt-2 text-slate-600">Please enter your new password below.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              <Form className="space-y-6">
                 {/* Password */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative">
                        <Lock className="absolute text-slate-400 left-4 top-3.5" size={20} />
                        <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        className="w-full py-3 pl-12 pr-12 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute text-slate-400 right-4 top-3.5 hover:text-slate-600"
                            >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-sm text-red-500 mt-1" />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute text-slate-400 left-4 top-3.5" size={20} />
                        <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="w-full py-3 pl-12 pr-12 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />
                         <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute text-slate-400 right-4 top-3.5 hover:text-slate-600"
                            >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-500 mt-1" />
                </div>


                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 font-bold text-white transition-all transform bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
