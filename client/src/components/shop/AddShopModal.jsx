// src/components/shop/AddShopModal.js

import React, { useState } from 'react';
import { useCreateShop } from '../../hooks/useShop';
import { Dialog } from '@headlessui/react';
import { Store, MapPin, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ErrorMessage, Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';

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
    .matches(/^(98|97|96)\d{8}$/, 'Please enter a valid Nepali mobile number (e.g., 98XXXXXXXX)')
    .required('Contact number is required') 
});

const validationSchemas = [step1Schema, step2Schema, step3Schema];

const AddShopModal = ({ isOpen, onClose, onCreationSuccess }) => {
  const { mutate: createShop, isLoading } = useCreateShop();
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
        onClose();
        const newShop = response.data.data;
        if (onCreationSuccess && newShop) {
          onCreationSuccess(newShop);
        }
      },
    });
  };
  
  const currentSchema = validationSchemas[step];

  // Animation variants for steps
  const stepVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 200 : -200,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -200 : 200,
      transition: { duration: 0.4, ease: 'easeInOut' },
    }),
  };

  const [direction, setDirection] = useState(1);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <motion.div 
        className="fixed inset-0 bg-black/40" 
        aria-hidden="true" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel as={motion.div} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg p-6 space-y-6 overflow-hidden bg-white shadow-2xl rounded-2xl sm:p-8">
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {['Name', 'Address', 'Contact'].map((label, index) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${step >= index ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                    {index === 0 && <Store size={18} />}
                    {index === 1 && <MapPin size={18} />}
                    {index === 2 && <Phone size={18} />}
                  </div>
                  <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${step >= index ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</p>
                </div>
                {index < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > index ? 'bg-indigo-600' : 'bg-slate-200'}`}/>}
              </React.Fragment>
            ))}
          </div>

          <Formik
            initialValues={formData}
            validationSchema={currentSchema}
            onSubmit={step < 2 ? handleNext : handleSubmit}
            enableReinitialize
          >
            {({ values }) => (
              <Form className="mt-6">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {step === 0 && <StepContent 
                          icon={<Store className="w-8 h-8 text-indigo-600"/>}
                          title="Let's name your shop"
                          subtitle="This is how your customers will see you. Make it memorable!"
                          name="name"
                          placeholder="e.g., My Awesome Store"
                        />}
                        {step === 1 && <StepContent 
                          icon={<MapPin className="w-8 h-8 text-indigo-600"/>}
                          title="Where can customers find you?"
                          subtitle="Adding a location helps with local discovery."
                          name="address"
                          placeholder="e.g., Umakunda-02, Ramechhap"
                        />}
                        {step === 2 && <StepContent
                          icon={<Phone className="w-8 h-8 text-indigo-600"/>}
                          title="Finally, a contact number"
                          subtitle="A contact number builds trust and makes communication easy."
                          name="contactNumber"
                          placeholder="e.g., 9841234567"
                        />}
                    </motion.div>
                </AnimatePresence>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-4">
                  <button
                    type="button"
                    onClick={() => { setDirection(-1); handleBack(); }}
                    disabled={step === 0 || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-0 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={() => setDirection(1)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 min-w-[130px] px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:shadow-xl active:scale-95 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     step === 2 ? 'Create Shop' : 'Next'}
                    {!isLoading && step < 2 && <ArrowRight className="w-4 h-4"/>}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Reusable component for the content of each step
const StepContent = ({ icon, title, subtitle, name, placeholder }) => (
    <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-indigo-50 rounded-full shadow-inner">
            {icon}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mb-6 text-sm text-slate-500">{subtitle}</p>
        <Field
            name={name}
            type="text"
            placeholder={placeholder}
            className="w-full p-4 text-center border-2 border-transparent rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
        />
        <ErrorMessage name={name} component="div" className="mt-2 text-sm font-semibold text-red-500" />
    </div>
);

export default AddShopModal;