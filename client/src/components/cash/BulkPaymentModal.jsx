import React, { useState, Fragment, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { useRecordCashIn, useRecordCashOut } from '../../hooks/useCash';
import { AuthContext } from '../../auth/authProvider';
import CustomerSelectionModal from '../../components/sales/CustomerSelectionModal'; // Your existing component
import SupplierSelectionModal from '../../components/purchase/SupplierSelectionModal'; // Your existing component
import { Loader2, Save, X, CircleAlert, User, Truck } from 'lucide-react';

const BulkPaymentModal = ({ isOpen, onClose, type }) => {
    const { currentShop } = useContext(AuthContext);
    const isCashIn = type === 'CASH_IN';

    const { mutate: recordCashIn, isPending: isSavingCashIn } = useRecordCashIn();
    const { mutate: recordCashOut, isPending: isSavingCashOut } = useRecordCashOut();
    const isPending = isSavingCashIn || isSavingCashOut;

    const [isPartyModalOpen, setPartyModalOpen] = useState(false);
    
    const title = isCashIn ? 'Record Cash In' : 'Record Cash Out';
    const partyLabel = isCashIn ? 'Customer' : 'Supplier';
    const partyIdField = isCashIn ? 'customerId' : 'supplierId';
    const partyNameField = isCashIn ? 'customerName' : 'supplierName';

    const validationSchema = Yup.object().shape({
        [partyIdField]: Yup.string().required(`${partyLabel} is required.`),
        amount: Yup.number().positive('Amount must be positive.').required('Amount is required.'),
        paymentMethod: Yup.string().required('Payment method is required.'),
    });

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/30" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex items-center justify-center min-h-full p-4 text-center">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-lg mx-auto overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Formik
                                initialValues={{
                                    [partyIdField]: '',
                                    [partyNameField]: '',
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
                                        payload.customerId = values.customerId;
                                        recordCashIn(payload, { onSuccess: onClose });
                                    } else {
                                        payload.supplierId = values.supplierId;
                                        recordCashOut(payload, { onSuccess: onClose });
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ values }) => (
                                    <Form>
                                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                            <Dialog.Title className="text-lg font-semibold text-slate-800">{title}</Dialog.Title>
                                            <button type="button" onClick={onClose} className="p-1 text-slate-500 rounded-full hover:bg-slate-100"><X size={20} /></button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Select {partyLabel}</label>
                                                {values[partyIdField] ? (
                                                    <div className="flex items-center justify-between p-3 mt-1 rounded-lg bg-indigo-50 border border-indigo-100">
                                                        <div className="flex items-center">{isCashIn ? <User className="w-5 h-5 mr-3 text-indigo-600"/> : <Truck className="w-5 h-5 mr-3 text-indigo-600"/>}<span className="font-medium text-indigo-800">{values[partyNameField]}</span></div>
                                                        <button type="button" onClick={() => setPartyModalOpen(true)} className="text-sm font-semibold text-indigo-600 hover:underline">Change</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={() => setPartyModalOpen(true)} className="flex items-center w-full p-4 mt-1 text-left transition-all border-2 border-dashed rounded-lg text-slate-500 border-slate-300 hover:border-indigo-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50">
                                                        <User className="w-5 h-5 mr-3"/><span className="font-medium">Click to select a {partyLabel}</span>
                                                    </button>
                                                )}
                                                <ErrorMessage name={partyIdField}>{msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}</ErrorMessage>
                                            </div>
                                            <div><label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label><Field name="amount" type="number" className="w-full p-2 mt-1 border-gray-300 rounded-md" /><ErrorMessage name="amount">{msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}</ErrorMessage></div>
                                            <div><label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label><Field as="select" name="paymentMethod" className="w-full p-2 mt-1 bg-white border-gray-300 rounded-md"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank</option></Field></div>
                                            <div><label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">Date (Optional)</label><Field name="transactionDate" type="date" className="w-full p-2 mt-1 border-gray-300 rounded-md" /></div>
                                            <div><label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label><Field as="textarea" rows={2} name="notes" className="w-full p-2 mt-1 border-gray-300 rounded-md" /></div>
                                        </div>
                                        <div className="flex justify-end p-4 border-t bg-slate-50 border-slate-200">
                                            <button type="submit" disabled={isPending} className="inline-flex items-center justify-center w-40 px-4 py-2 text-sm font-medium text-white transition-all bg-emerald-600 border border-transparent rounded-lg shadow-sm hover:bg-emerald-700 disabled:bg-emerald-400 hover:shadow-md active:scale-95">
                                                {isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</> : <><Save className="w-5 h-5 mr-2" />Record Payment</> }
                                            </button>
                                        </div>
                                        
                                        {/* Conditionally render the correct selection modal */}
                                        {isCashIn ? (
                                            <CustomerSelectionModal isOpen={isPartyModalOpen} onClose={() => setPartyModalOpen(false)} />
                                        ) : (
                                            <SupplierSelectionModal isOpen={isPartyModalOpen} onClose={() => setPartyModalOpen(false)} />
                                        )}
                                    </Form>
                                )}
                            </Formik>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
};

export default BulkPaymentModal;