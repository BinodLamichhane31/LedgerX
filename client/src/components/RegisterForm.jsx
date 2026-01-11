import { useRegisterUser } from '../hooks/auth/useRegisterUser';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
} from 'lucide-react';

export default function RegisterForm() {
  const { mutate, isLoading } = useRegisterUser();

  const initialValues = {
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    fname: Yup.string().required('First name is required'),
    lname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(12, 'Password must be at most 12 characters')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const onSubmit = (values,{resetForm}) => {
    const { fname, lname, email, phone, password } = values;
    const payload = { fname, lname, email, phone, password };
    mutate(payload, {
    onSuccess: () => {
      resetForm(); 
    },
  });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {() => (
            <Form className="space-y-6">
              <div className="flex flex-col gap-4 mb-6">
                <button
                  type="button"
                  className="flex items-center justify-center w-full px-4 py-3 font-semibold transition-all duration-200 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                  Sign up with Google
                </button>
                
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  <div className="relative px-4 text-sm text-slate-400 bg-white">Or sign up with email</div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="relative">
                    <User className="absolute text-slate-400 left-4 top-3.5" size={20} />
                    <Field
                      name="fname"
                      placeholder="First Name"
                      className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <ErrorMessage name="fname" component="div" className="mt-1 text-sm text-red-500" />
                  </div>

                  <div className="relative">
                    <User className="absolute text-slate-400 left-4 top-3.5" size={20} />
                    <Field
                      name="lname"
                      placeholder="Last Name"
                      className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <ErrorMessage name="lname" component="div" className="mt-1 text-sm text-red-500" />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute text-slate-400 left-4 top-3.5" size={20} />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                <div className="relative">
                  <Phone className="absolute text-slate-400 left-4 top-3.5" size={20} />
                  <Field
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                <div className="relative">
                  <Lock className="absolute text-slate-400 left-4 top-3.5" size={20} />
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-500" />
                </div>

                <div className="relative">
                  <KeyRound className="absolute text-slate-400 left-4 top-3.5" size={20} />
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full py-3 pl-12 pr-4 transition-all border border-slate-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3.5 mt-6 font-bold text-white transition-all transform bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <p className="mt-4 text-center text-slate-500">
                Already have an account?{' '}
                <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Log in
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
