import React, { useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPurchaseById, useCancelPurchase, useRecordPaymentForPurchase } from '../../hooks/usePurchase'; // <-- Use Purchase Hooks
import { ConfirmationModal } from '../../components/common/ConfirmationModel';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { useGetShopById } from '../../hooks/useShop';

import { ChevronLeft, Loader2, CircleAlert, Printer, XCircle, Banknote, Save, X } from 'lucide-react';

const StatusBadge = ({ record }) => {
    let config = { text: 'Unpaid', className: 'bg-red-100 text-red-800' };
    if (record.status === 'CANCELLED') {
        config = { text: 'Cancelled', className: 'bg-gray-200 text-gray-700 line-through' };
    } else {
        switch (record.paymentStatus) {
            case 'PAID': config = { text: 'Paid', className: 'bg-emerald-100 text-emerald-800' }; break;
            case 'PARTIAL': config = { text: 'Partial', className: 'bg-amber-100 text-amber-800' }; break;
            case 'UNPAID': config = { text: 'Unpaid', className: 'bg-rose-100 text-rose-800' }; break;
            default: break;
        }
    }
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>{config.text}</span>;
};

const PurchaseDetailHeader = ({ purchase, onPrint, onCancelClick, onPaymentClick, canCancel, canRecordPayment }) => (
    <div className="flex flex-col items-start justify-between gap-4 pb-6 border-b print:hidden md:flex-row md:items-center">
        <div>
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bill #{purchase.billNumber}</h1>
                <StatusBadge record={purchase} />
            </div>
            <p className="mt-1 text-sm text-gray-500">Purchase recorded on {new Date(purchase.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center flex-shrink-0 gap-2">
            <button onClick={onPrint} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"><Printer size={16} /> Print</button>
            {canRecordPayment && (<button onClick={onPaymentClick} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700"><Banknote size={16} /> Record Payment</button>)}
            {canCancel && (<button onClick={onCancelClick} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg shadow-sm hover:bg-rose-700"><XCircle size={16} /> Cancel Purchase</button>)}
        </div>
    </div>
);

const ShopInfoForPrint = ({ shopId }) => {
    const { data: shopData } = useGetShopById(shopId);
    if (!shopData) return null;
    return (
        <div className="items-center hidden pb-6 mb-6 border-b print:block">
            <h2 className="text-2xl font-bold text-gray-900">{shopData.name}</h2>
            <address className="mt-1 text-xs not-italic text-gray-500">
                {shopData.address && <p>{shopData.address}</p>}
                {shopData.contactNumber && <p>{shopData.contactNumber}</p>}
            </address>
        </div>
    );
};

const SupplierInfo = ({ supplier }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-800">Purchased From</h3>
        <address className="mt-2 text-sm not-italic text-gray-600">
            {supplier ? (
                <>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p>{supplier.phone}</p>
                    {supplier.email && <p>{supplier.email}</p>}
                    {supplier.address && <p>{supplier.address}</p>}
                </>
            ) : (<p className="font-medium text-gray-900">Cash Purchase</p>)}
        </address>
    </div>
);

const PurchaseMetadata = ({ purchase }) => (
     <div className="text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="font-semibold text-gray-800">Purchase Date:</dt><dd className="text-gray-600">{new Date(purchase.purchaseDate).toLocaleDateString()}</dd>
            <dt className="font-semibold text-gray-800">Purchase Type:</dt><dd className="text-gray-600">{purchase.purchaseType}</dd>
            <dt className="font-semibold text-gray-800">Created By:</dt><dd className="text-gray-600">{purchase.createdBy ? `${purchase.createdBy.fname} ${purchase.createdBy.lname}` : 'N/A'}</dd>
        </dl>
    </div>
);

const PurchaseItemsTable = ({ items }) => (
    <div className="mt-6"><div className="mt-4 -mx-8 overflow-x-auto print:overflow-visible print:mx-0"><div className="inline-block min-w-full px-8 align-middle print:px-0">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-4 py-2 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Product</th>
                    <th className="px-4 py-2 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Unit Cost</th>
                    <th className="px-4 py-2 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">Total</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                    <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{item.unitCost.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</td>
                        <td className="px-4 py-3 text-sm font-medium text-right text-gray-800">{item.total.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div></div></div>
);

const PurchaseFinancials = ({ purchase }) => (
    <div className="flex justify-end mt-6"><div className="w-full max-w-sm space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium text-gray-800">{purchase.subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="font-medium text-gray-800">- {purchase.discount.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span></div>
        <div className="flex justify-between pt-2 mt-2 text-base font-bold border-t"><span className="text-slate-900">Grand Total:</span><span className="text-slate-900">{purchase.grandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span></div>
        <div className="flex justify-between"><span className="text-slate-600">Amount Paid:</span><span className="font-medium text-emerald-600">{purchase.amountPaid.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span></div>
        <div className="flex justify-between p-3 text-lg font-bold text-indigo-800 rounded-lg bg-indigo-50"><span>Amount To Pay:</span><span>{purchase.amountDue.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })}</span></div>
    </div></div>   
);

const RecordPaymentModal = ({ isOpen, onClose, purchase }) => {
    const { mutate: recordPayment, isPending } = useRecordPaymentForPurchase();
    const PaymentSchema = Yup.object().shape({
        amountPaid: Yup.number().positive('Amount must be positive.').max(purchase.amountDue, `Payment cannot exceed the amount due of Rs. ${purchase.amountDue.toFixed(2)}.`).required('Amount is required.'),
        paymentMethod: Yup.string()
    });

    return (
        <Transition appear show={isOpen} as={Fragment}><Dialog as="div" className="relative z-50" onClose={onClose}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/30" /></Transition.Child>
            <div className="fixed inset-0 overflow-y-auto"><div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md mx-auto overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <Formik
                        initialValues={{ amountPaid: purchase.amountDue, paymentMethod: 'CASH' }}
                        validationSchema={PaymentSchema}
                        onSubmit={(values, { setSubmitting }) => { recordPayment({ id: purchase._id, ...values }, { onSuccess: () => { setSubmitting(false); onClose(); } }); }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="flex items-center justify-between p-4 border-b"><Dialog.Title className="text-lg font-semibold text-gray-800">Record Payment</Dialog.Title><button type="button" onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100"><X size={20} /></button></div>
                                <div className="p-6 space-y-4"><div><label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount to Pay (Due: {purchase.amountDue.toLocaleString('en-IN', { style: 'currency', currency: 'NPR' })})</label><Field name="amountPaid" type="number" className="w-full p-2 mt-1 border-gray-300 rounded-md" /><ErrorMessage name="amountPaid">{msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}</ErrorMessage></div><div><label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label><Field as="select" name="paymentMethod" className="w-full p-2 mt-1 bg-white border-gray-300 rounded-md"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CHEQUE">Cheque</option></Field></div></div>
                                <div className="flex justify-end p-4 border-t bg-gray-50"><button type="submit" disabled={isSubmitting || isPending} className="inline-flex items-center justify-center w-32 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400">{isSubmitting || isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</> : <><Save className="w-5 h-5 mr-2" />Save</> }</button></div>
                            </Form>
                        )}
                    </Formik>
                </Dialog.Panel>
            </Transition.Child>
            </div></div>
        </Dialog></Transition>
    );
};

const PurchaseDetailsPage = () => {
    const { id } = useParams();
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    const { data: purchase, isLoading, isError, error } = useGetPurchaseById(id);
    const { mutate: cancelPurchase, isPending: isCancelling } = useCancelPurchase();

    const handleConfirmCancel = () => {
        cancelPurchase(id, { onSuccess: () => { setCancelModalOpen(false); } });
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
    if (isError || !purchase) return (
        <div className="flex flex-col items-center justify-center h-screen p-8 text-center text-red-600 bg-red-50" role="alert">
            <CircleAlert className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Error Loading Purchase</h2>
            <p>{error?.message || 'The purchase could not be found or an error occurred.'}</p>
            <Link to="/purchases" className="inline-block px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600">Back to Purchases</Link>
        </div>
    );
    
    const canCancel = purchase.status !== 'CANCELLED';
    const canRecordPayment = purchase.status !== 'CANCELLED' && purchase.paymentStatus !== 'PAID' && purchase.purchaseType === 'SUPPLIER';

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto print:max-w-none">
                <Link to="/purchases" className="inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-slate-500 print:hidden hover:text-indigo-600"><ChevronLeft size={16} />Back to Purchase History</Link>
                <div className="p-8 bg-white shadow-lg print:shadow-none rounded-xl ring-1 ring-gray-900/5 print:ring-0">
                    <ShopInfoForPrint shopId={purchase.shop} />
                    <div className="items-end justify-between hidden pb-6 mb-6 border-b print:flex">
                        <div><h1 className="text-3xl font-bold text-gray-900">PURCHASE VOUCHER</h1><p className="text-sm text-gray-500">Bill #{purchase.billNumber}</p></div>
                    </div>
                    <PurchaseDetailHeader purchase={purchase} onPrint={() => window.print()} onCancelClick={() => setCancelModalOpen(true)} onPaymentClick={() => setPaymentModalOpen(true)} canCancel={canCancel} canRecordPayment={canRecordPayment} />
                    <div className="grid grid-cols-1 gap-8 py-6 md:grid-cols-2">
                        <SupplierInfo supplier={purchase.supplier} />
                        <PurchaseMetadata purchase={purchase} />
                    </div>
                    <PurchaseItemsTable items={purchase.items} />
                    <PurchaseFinancials purchase={purchase} />
                    {purchase.notes && (<div className="pt-6 mt-6 border-t"><h3 className="text-sm font-semibold text-gray-800">Notes</h3><p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{purchase.notes}</p></div>)}
                </div>
            </div>
            {canCancel && (<ConfirmationModal isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleConfirmCancel} title="Cancel Purchase" message={`Are you sure you want to cancel Bill #${purchase.billNumber}? This will remove items from stock and reverse any transactions. This action cannot be undone.`} confirmText="Yes, Cancel Purchase" isPending={isCancelling} />)}
            {canRecordPayment && (<RecordPaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} purchase={purchase} />)}
        </div>
    );
};

export default PurchaseDetailsPage;