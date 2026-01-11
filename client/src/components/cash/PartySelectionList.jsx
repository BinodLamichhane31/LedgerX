import React, { Fragment } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { useRecordCashIn, useRecordCashOut } from '../../hooks/useCash';
import { AuthContext } from '../../auth/authProvider';
import { useContext } from 'react';
import { Loader2, Save, X, CircleAlert, User, Truck } from 'lucide-react';

const PaymentFormModal = ({ isOpen, onClose, party, type }) => {
    const { currentShop } = useContext(AuthContext);
    const { mutate: recordCashIn, isPending: isSavingCashIn } = useRecordCashIn();
    const { mutate: recordCashOut, isPending: isSavingCashOut } = useRecordCashOut();
    const isPending = isSavingCashIn || isSavingCashOut;
    const isCashIn = type === 'CASH_IN';

    // This validation schema remains the same
    const validationSchema = Yup.object().shape({
        amount: Yup.number()
            .positive('Amount must be positive.')
            .max(party.currentBalance, `Cannot exceed balance of Rs. ${party.currentBalance.toLocaleString()}`)
            .required('Amount is required.'),
        paymentMethod: Yup.string().required('Payment method is required.'),
    });

    // --- NEW: A reusable CSS class string for all form inputs ---
    const inputClasses = "block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm";

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg mx-auto overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <Formik
                                    initialValues={{
                                        amount: party.currentBalance > 0 ? party.currentBalance : '',
                                        paymentMethod: 'CASH',
                                        notes: '',
                                        transactionDate: new Date().toISOString().split('T')[0]
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={(values, { setSubmitting }) => {
                                        const payload = {
                                            shopId: currentShop._id,
                                            amount: Number(values.amount),
                                            paymentMethod: values.paymentMethod,
                                            notes: values.notes,
                                            ...(values.transactionDate && { transactionDate: values.transactionDate }),
                                        };
                                        if (isCashIn) {
                                            payload.customerId = party._id;
                                            recordCashIn(payload, { onSuccess: onClose });
                                        } else {
                                            payload.supplierId = party._id;
                                            recordCashOut(payload, { onSuccess: onClose });
                                        }
                                        setSubmitting(false);
                                    }}
                                >
                                    <Form>
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <Dialog.Title className="text-lg font-semibold text-gray-800">Record Payment</Dialog.Title>
                                            <button type="button" onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100"><X size={20} /></button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {/* --- THEME CHANGE: Blue to Orange --- */}
                                            <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                                                <label className="text-xs font-semibold text-orange-700">{isCashIn ? 'PAYMENT FROM CUSTOMER' : 'PAYMENT TO SUPPLIER'}</label>
                                                <div className="flex items-center mt-1">
                                                    {isCashIn ? <User className="w-5 h-5 mr-3 text-orange-600"/> : <Truck className="w-5 h-5 mr-3 text-orange-600"/>}
                                                    <span className="font-medium text-orange-900">{party.name}</span>
                                                    <span className="ml-auto text-sm text-orange-900">Balance: Rs. {party.currentBalance.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            
                                            {/* --- FORM FIELD STYLING CHANGES --- */}
                                            <div>
                                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                                <Field name="amount" type="number" className={inputClasses} />
                                                <ErrorMessage name="amount">{msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}</ErrorMessage>
                                            </div>
                                            <div>
                                                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                                                <Field as="select" name="paymentMethod" className={inputClasses}>
                                                    <option value="CASH">Cash</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                    <option value="CARD">Card</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                </Field>
                                            </div>
                                            <div>
                                                <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">Date</label>
                                                <Field name="transactionDate" type="date" className={inputClasses} />
                                            </div>
                                            <div>
                                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                                <Field as="textarea" rows={2} name="notes" className={inputClasses} placeholder="e.g., Paid via QR, partial payment..." />
                                            </div>
                                        </div>
                                        <div className="flex justify-end p-4 border-t bg-gray-50">
                                            {/* --- THEME CHANGE: Green to Orange --- */}
                                            <button type="submit" disabled={isPending} className="inline-flex items-center justify-center w-32 px-4 py-2 text-sm font-medium text-white transition-colors bg-orange-500 border border-transparent rounded-md shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</> : <><Save className="w-5 h-5 mr-2" />Save</>}
                                            </button>
                                        </div>
                                    </Form>
                                </Formik>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PaymentFormModal;