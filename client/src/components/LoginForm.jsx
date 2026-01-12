import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLoginUser } from '../hooks/auth/useLoginUser';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginForm() {
  const { mutate, isLoading } = useLoginUser();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
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
      }
    });
  };

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form className="space-y-6">
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-3 font-semibold transition-all duration-200 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                Continue with Google
              </button>
              
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative px-4 text-sm text-slate-400 bg-white">Or continue with email</div>
              </div>
            </div>

            <div className="space-y-5">
               <div className="relative">
                 <Mail className="absolute text-slate-400 left-4 top-3.5" size={20} />
                 <Field
                   type="email"
                   name="email"
                   placeholder="Email Address"
                   autoComplete="email"
                   className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                 />
                 <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
               </div>

               <div className="relative">
                 <Lock className="absolute text-slate-400 left-4 top-3.5" size={20} />
                 <Field
                   type={showPassword ? "text" : "password"}
                   name="password"
                   placeholder="Password"
                   autoComplete="current-password"
                   className="w-full py-3 pl-12 pr-12 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute text-slate-400 right-4 top-3.5 hover:text-slate-600"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
                 <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-500" />
               </div>
            </div>

            {/* reCAPTCHA */}
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
              className="w-full px-4 py-3.5 font-bold text-white transition-all transform bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <p className="text-center text-slate-500">
              Don't have an account?{' '}
              <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create account
              </a>
            </p>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
