// src/pages/shop/CreateFirstShop.js

import React, { useState } from 'react';
import { useCreateShop } from '../../hooks/useShop';
import { Store, MapPin, Phone, Loader2, ArrowRight, ArrowLeft, PartyPopper } from 'lucide-react';
import { ErrorMessage, Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';

// Validation Schemas - all fields are now required
const step1Schema = Yup.object({
  name: Yup.string().min(3, 'Shop name is too short!').required('A great shop needs a name!'),
});
const step2Schema = Yup.object({
  address: Yup.string().min(5, 'Please provide a more detailed address.').required('Address is required to put you on the map!'),
});
const step3Schema = Yup.object({
  contactNumber: Yup.string().matches(/^(?:\+977|98)\d{8,9}$/, 'Please enter a valid Nepali phone number.').required('A contact number is crucial for customers!'),
});

const validationSchemas = [step1Schema, step2Schema, step3Schema];

const CreateFirstShop = () => {
  const { mutate: createShop, isLoading, isSuccess } = useCreateShop();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
  });

  const handleNext = (values) => {
    setFormData(prev => ({ ...prev, ...values }));
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (values) => {
    const finalData = { ...formData, ...values };
    createShop(finalData, {
      onSuccess: (response) => {
        const newShop = response.data.data;
        if (newShop && newShop._id) {
          localStorage.setItem("currentShopId", newShop._id);
          // Redirect after a short delay to show the success message
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      },
    });
  };

  const currentSchema = validationSchemas[step];
  const [direction, setDirection] = useState(1);

  // Animation variants for step transitions
  const stepVariants = {
    hidden: (direction) => ({ opacity: 0, x: direction > 0 ? 300 : -300 }),
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? -300 : 300, transition: { duration: 0.5, ease: 'easeInOut' } }),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-orange-100">
      <div className="w-full max-w-2xl">
        {/* Progress Bar and Title Section */}
        <div className="p-8 text-center bg-white shadow-lg rounded-t-2xl">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Let's Launch Your Digital Dukaan!
          </h1>
          <p className="mt-2 text-slate-600">
            Complete these 3 quick steps to get your business online.
          </p>
          <div className="flex items-center justify-between w-full max-w-md mx-auto mt-8">
            {['Name', 'Address', 'Contact'].map((label, index) => (
              <React.Fragment key={label}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${step >= index ? 'bg-orange-500 text-white scale-110' : 'bg-slate-200 text-slate-500'}`}>
                  {index === 0 && <Store />}
                  {index === 1 && <MapPin />}
                  {index === 2 && <Phone />}
                </div>
                {index < 2 && <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${step > index ? 'bg-orange-500' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Section with cool background */}
        <div className="relative p-8 overflow-hidden shadow-lg bg-slate-800 rounded-b-2xl">
          <Formik
            initialValues={formData}
            validationSchema={currentSchema}
            onSubmit={step < 2 ? handleNext : handleSubmit}
            enableReinitialize
          >
            <Form className="min-h-[300px] flex flex-col justify-between">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center text-white"
                  >
                    <PartyPopper className="w-24 h-24 text-amber-400" />
                    <h2 className="mt-4 text-2xl font-bold">All Set!</h2>
                    <p className="mt-2 text-slate-300">Your shop has been created. Redirecting you to the dashboard...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {step === 0 && <StepContent title="First, what is your shop's name?" subtitle="This is how customers will find and remember you." name="name" placeholder="e.g., The Corner Cafe" />}
                    {step === 1 && <StepContent title="Where is your shop located?" subtitle="A clear address helps customers find you in the real world." name="address" placeholder="e.g., Putalisadak, Kathmandu" />}
                    {step === 2 && <StepContent title="And a contact number?" subtitle="This builds trust and makes it easy for customers to reach you." name="contactNumber" placeholder="e.g., 98XXXXXXXX" />}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons - hide them on success */}
              {!isSuccess && (
                <div className="flex justify-between pt-8 mt-4">
                  <button
                    type="button"
                    onClick={() => { setDirection(-1); handleBack(); }}
                    disabled={step === 0 || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full text-slate-300 hover:bg-slate-700 disabled:opacity-0"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    onClick={() => setDirection(1)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 min-w-[130px] px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 2 ? 'Launch My Shop!' : 'Next'}
                    {!isLoading && step < 2 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

// Reusable component for the content of each step, styled for the dark background
const StepContent = ({ title, subtitle, name, placeholder }) => (
  <div className="text-center">
    <h3 className="text-2xl font-bold text-white">{title}</h3>
    <p className="mb-8 text-sm text-slate-400">{subtitle}</p>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      className="w-full max-w-md p-4 text-lg text-center text-white transition-all duration-300 border-2 rounded-lg bg-slate-700/50 border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none"
    />
    <ErrorMessage name={name} component="div" className="mt-2 text-sm font-semibold text-red-400" />
  </div>
);

export default CreateFirstShop;