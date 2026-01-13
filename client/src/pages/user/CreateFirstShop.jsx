import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateShop, useGetShops } from '../../hooks/useShop';

// Validation Schemas for each step
const step1Schema = Yup.object({ 
  name: Yup.string()
    .min(3, 'Shop name must be at least 3 characters')
    .max(100, 'Shop name must be less than 100 characters')
    .required('Shop name is required') 
});

const step2Schema = Yup.object({ 
  address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .required('Address is required') 
});

const step3Schema = Yup.object({ 
  contactNumber: Yup.string()
    .matches(/^(98|97)\d{8}$/, 'Please enter a valid Nepali mobile number (e.g., 9841234567)')
    .required('Contact number is required') 
});

const validationSchemas = [step1Schema, step2Schema, step3Schema];

const CreateFirstShop = () => {
  const navigate = useNavigate();
  const { mutate: createShop, isLoading } = useCreateShop();
  const { data: shops, isLoading: isLoadingShops } = useGetShops();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
  });

  // Redirect if user already has shops
  useEffect(() => {
    if (!isLoadingShops && shops && shops.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [shops, isLoadingShops, navigate]);

  // Show loading while checking shops
  if (isLoadingShops) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNext = (values) => {
    setFormData(prev => ({ ...prev, ...values }));
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleSubmit = (values) => {
    const finalData = { ...formData, ...values };
    createShop(finalData, {
      onSuccess: () => {
        navigate('/dashboard', { replace: true });
      },
    });
  };

  const currentSchema = validationSchemas[step];

  // Animation variants
  const stepVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 300 : -300,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -300 : 300,
      transition: { duration: 0.4, ease: 'easeInOut' },
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="relative p-8 overflow-hidden bg-white shadow-xl md:p-12 rounded-3xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-2xl -z-0"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-12">
              {['Name', 'Address', 'Contact'].map((label, index) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${step >= index ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-400'}`}>
                      {index === 0 && <Store size={20} />}
                      {index === 1 && <MapPin size={20} />}
                      {index === 2 && <Phone size={20} />}
                    </div>
                    <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${step >= index ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</p>
                  </div>
                  {index < 2 && <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${step > index ? 'bg-indigo-600' : 'bg-slate-200'}`}/>}
                </div>
              ))}
            </div>

            {/* Form */}
            <Formik
              initialValues={formData}
              validationSchema={currentSchema}
              onSubmit={step < 2 ? handleNext : handleSubmit}
              enableReinitialize
            >
              <Form>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center"
                  >
                    {step === 0 && (
                      <StepContent 
                        icon={<Store className="w-10 h-10 text-indigo-600"/>}
                        title="Let's name your shop"
                        subtitle="This is how your customers will see you. Make it memorable!"
                        name="name"
                        placeholder="e.g., My Awesome Store"
                      />
                    )}
                    {step === 1 && (
                      <StepContent 
                        icon={<MapPin className="w-10 h-10 text-indigo-600"/>}
                        title="Where can customers find you?"
                        subtitle="Adding a location helps with local discovery."
                        name="address"
                        placeholder="e.g., Kathmandu, Nepal"
                      />
                    )}
                    {step === 2 && (
                      <StepContent
                        icon={<Phone className="w-10 h-10 text-indigo-600"/>}
                        title="Finally, a contact number"
                        subtitle="A contact number builds trust and makes communication easy."
                        name="contactNumber"
                        placeholder="e.g., 9841234567"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-8 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0 || isLoading}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 min-w-[140px] px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:shadow-xl active:scale-95 transition-all"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {step === 2 ? (
                          <>
                            <Sparkles className="w-4 h-4"/>
                            Create Shop
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4"/>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            You can add more shops later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable component for step content
const StepContent = ({ icon, title, subtitle, name, placeholder }) => (
  <div className="py-8">
    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-indigo-50">
      {icon}
    </div>
    <h2 className="mb-3 text-3xl font-bold text-slate-900">{title}</h2>
    <p className="mb-8 text-slate-600">{subtitle}</p>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      className="w-full p-4 text-lg text-center transition-all border-2 border-transparent rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
    />
    <ErrorMessage name={name} component="div" className="mt-3 text-sm font-semibold text-red-500" />
  </div>
);

export default CreateFirstShop;
