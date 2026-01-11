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

    const validationSchema = Yup.object().shape({
        amount: Yup.number()
            .positive('Amount must be positive.')
            .max(party.currentBalance, `Cannot exceed balance of Rs. ${party.currentBalance.toLocaleString()}`)
            .required('Amount is required.'),
        paymentMethod: Yup.string().required('Payment method is required.'),
    });

    const inputClasses = "block w-full px-3 py-2.5 mt-1 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all";

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
                                        amount: '',
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
                                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                            <Dialog.Title className="text-lg font-semibold text-slate-800">Record Payment</Dialog.Title>
                                            <button type="button" onClick={onClose} className="p-1 text-slate-500 rounded-full hover:bg-slate-100"><X size={20} /></button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="p-4 border rounded-xl border-indigo-100 bg-indigo-50/50">
                                                <label className="text-xs font-bold tracking-wider text-indigo-600 uppercase">{isCashIn ? 'Payment From Customer' : 'Payment To Supplier'}</label>
                                                <div className="flex items-center mt-2">
                                                    {isCashIn ? <User className="w-5 h-5 mr-3 text-indigo-600"/> : <Truck className="w-5 h-5 mr-3 text-indigo-600"/>}
                                                    <span className="text-lg font-semibold text-slate-900">{party.name}</span>
                                                    <span className="ml-auto text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">Balance: Rs. {party.currentBalance.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                                <Field name="amount" type="number" className={inputClasses} placeholder="Enter amount..."/>
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
                                        <div className="flex justify-end p-4 border-t bg-slate-50 border-slate-200">
                                            <button type="submit" disabled={isPending} className="inline-flex items-center justify-center w-32 px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95">
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