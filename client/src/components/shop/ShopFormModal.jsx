// src/components/shop/ShopFormModal.jsx

import { Dialog } from '@headlessui/react';
import { PlusCircle, XCircle, Loader2 } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCreateShop, useUpdateShop } from '../../hooks/useShop';

const ShopFormModal = ({ isOpen, onClose, shop }) => {
  const isEditMode = Boolean(shop);

  const { mutate: createShop, isLoading: isCreating } = useCreateShop();
  const { mutate: updateShop, isLoading: isUpdating } = useUpdateShop();

  const isLoading = isCreating || isUpdating;

  const initialValues = {
    name: shop?.name || '',
    address: shop?.address || '',
    contactNumber: shop?.contactNumber || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Shop name must be at least 3 characters')
      .max(100, 'Shop name must be less than 100 characters')
      .required('Shop name is required'),
    address: Yup.string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must be less than 200 characters')
      .required('Address is required'),
    contactNumber: Yup.string()
      .matches(/^(98|97|96)\d{8}$/, 'Please enter a valid Nepali mobile number (e.g., 98XXXXXXXX)')
      .required('Contact number is required'),
  });

  const handleSubmit = (values) => {
    if (isEditMode) {
      updateShop({ id: shop._id, data: values }, {
        onSuccess: () => onClose(),
      });
    } else {
      createShop(values, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              {isEditMode ? 'Edit Shop' : 'Add New Shop'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500"><XCircle size={24} /></button>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize // Important for edit mode
          >
            <Form className="mt-6 space-y-4">
              {/* Form fields are the same as before */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Shop Name</label>
                <Field name="name" type="text" className="w-full p-2.5 mt-1 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-500" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <Field name="address" type="text" className="w-full p-2.5 mt-1 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-500" />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <Field name="contactNumber" type="text" className="w-full p-2.5 mt-1 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                <ErrorMessage name="contactNumber" component="div" className="mt-1 text-sm text-red-500" />
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex items-center justify-center min-w-[120px] px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? 'Save Changes' : 'Add Shop')}
                </button>
              </div>
            </Form>
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShopFormModal;