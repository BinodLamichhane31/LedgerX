import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SupplierSelectionModal from '../../components/purchase/SupplierSelectionModal';
import ProductSelectionModalForPurchase from '../../components/purchase/ProductSelectionPageForPurchase';
import { useCreatePurchase } from '../../hooks/usePurchase'; 
import { AuthContext } from '../../auth/authProvider';

import { ChevronLeft, User, Store, Plus, X, Trash2, Save, Loader2, FileText, CircleAlert, Calendar, BookText } from 'lucide-react';

const purchaseValidationSchema = Yup.object().shape({
    isCashPurchase: Yup.boolean(),
    supplierId: Yup.string().when('isCashPurchase', {
        is: false,
        then: schema => schema.required('A supplier must be selected for credit purchases.'),
        otherwise: schema => schema.notRequired(),
    }),
    items: Yup.array()
        .of(
            Yup.object().shape({
                quantity: Yup.number().min(1, 'Min 1').required(),
                productId: Yup.string().required(),
                name: Yup.string().required(),
                unitCost: Yup.number().min(0, 'Cannot be negative').required(),
            })
        )
        .min(1, 'Please add at least one product to the purchase.'),
    amountPaid: Yup.number()
        .min(0, 'Amount paid cannot be negative.')
        .max(Yup.ref('grandTotal'), 'Amount paid cannot exceed the grand total.'),
});

const FormikErrorMessage = ({ name }) => ( <ErrorMessage name={name}>{msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}</ErrorMessage> );

const PurchaseSummary = ({ values, isCashPurchase }) => {
    const amountDue = values.grandTotal - values.amountPaid;
    return (
        <div className="sticky p-6 space-y-4 bg-white shadow-lg top-8 rounded-xl ring-1 ring-gray-900/5">
            <h2 className="pb-4 text-xl font-semibold text-gray-800 border-b">Purchase Summary</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium text-gray-800">Rs. {values.subTotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><label htmlFor="discount" className="text-gray-600">Discount (Rs.)</label><Field name="discount" type="number" className="w-24 p-1 text-right border-gray-300 rounded-md"/></div>
            </div>
            <div className="pt-4 mt-2 border-t-2 border-dashed">
                <div className="flex justify-between text-lg font-bold text-gray-900"><span>Grand Total</span><span>Rs. {values.grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                    <label htmlFor="amountPaid" className="font-medium text-gray-700">Amount Paid</label>
                    <Field name="amountPaid" type="number" disabled={isCashPurchase} className="p-1 font-semibold text-right border-gray-300 rounded-md w-28 disabled:bg-gray-200 disabled:cursor-not-allowed" />
                </div>
                <FormikErrorMessage name="amountPaid" />
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-indigo-50">
                <span className="font-semibold text-indigo-800">Amount To Pay</span>
                <span className="font-bold text-indigo-800">Rs. {amountDue > 0 ? amountDue.toFixed(2) : '0.00'}</span>
            </div>
        </div>
    );
};

const CreatePurchasePage = () => {
    const navigate = useNavigate();
    const { currentShop } = useContext(AuthContext);
    const { mutate: createPurchase, isPending } = useCreatePurchase();
    
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    return (
        <Formik
            initialValues={{
                isCashPurchase: true, supplierId: '', supplierName: '', items: [],
                discount: 0, subTotal: 0, grandTotal: 0, amountPaid: 0,
                purchaseDate: new Date().toISOString().split('T')[0], notes: '', billNumber: ''
            }}
            validationSchema={purchaseValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
                const finalPurchaseData = {
                    shopId: currentShop._id,
                    supplierId: values.isCashPurchase ? null : values.supplierId,
                    items: values.items.map(item => ({ productId: item.productId, quantity: Number(item.quantity), unitCost: Number(item.unitCost) })),
                    discount: Number(values.discount), amountPaid: Number(values.amountPaid),
                    notes: values.notes, purchaseDate: values.purchaseDate, billNumber: values.billNumber,
                };
                createPurchase(finalPurchaseData, {
                    onSuccess: () => navigate('/purchases'),
                    onSettled: () => setSubmitting(false)
                });
            }}
        >
            {({ values, setFieldValue, isSubmitting }) => {
                useEffect(() => {
                    const newSubTotal = values.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitCost)), 0);
                    setFieldValue('subTotal', newSubTotal);
                }, [values.items, setFieldValue]);

                useEffect(() => {
                    const newGrandTotal = values.subTotal - Number(values.discount);
                    setFieldValue('grandTotal', newGrandTotal);
                }, [values.subTotal, values.discount, setFieldValue]);

                useEffect(() => {
                    if (values.isCashPurchase) setFieldValue('amountPaid', values.grandTotal);
                }, [values.isCashPurchase, values.grandTotal, setFieldValue]);

                return (
                    <Form>
                        <div className="p-4 bg-slate-50 sm:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-200">
                                   <div className="flex items-center gap-4">
                                        <Link to="/purchases" className="p-2 text-gray-500 transition-colors rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></Link>
                                        <div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Purchase</h1><p className="mt-1 text-sm text-slate-500">Record new stock coming into your shop.</p></div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting || isPending} className="inline-flex items-center justify-center w-48 px-4 py-3 text-sm font-medium text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:bg-gray-400">
                                        {isSubmitting || isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                        {isSubmitting || isPending ? 'Saving...' : 'Complete Purchase'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                    <div className="space-y-6 lg:col-span-2">
                                        <div className="p-6 bg-white shadow-lg rounded-xl ring-1 ring-gray-900/5">
                                            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-gray-800">Supplier & Details</h2>
                                                <div className="p-1 rounded-lg bg-slate-100">
                                                    <button type="button" onClick={() => setFieldValue('isCashPurchase', true)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${values.isCashPurchase ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cash Purchase</button>
                                                    <button type="button" onClick={() => { setFieldValue('isCashPurchase', false); if(!values.supplierId) setIsSupplierModalOpen(true); }} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${!values.isCashPurchase ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Credit Purchase</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div><label className="block text-sm font-medium text-slate-600">Purchased From</label>
                                                    {values.isCashPurchase ? (<div className="flex items-center p-3 mt-1 rounded-lg bg-slate-100"><Store className="w-5 h-5 mr-3 text-slate-500"/><span className="font-medium text-slate-800">Cash Purchase</span></div>) : values.supplierId ? (<div className="flex items-center justify-between p-3 mt-1 rounded-lg bg-indigo-50"><div className="flex items-center"><User className="w-5 h-5 mr-3 text-indigo-600"/><span className="font-medium text-indigo-800">{values.supplierName}</span></div><button type="button" onClick={() => setIsSupplierModalOpen(true)} className="text-sm font-semibold text-indigo-600 hover:underline">Change</button></div>) : (<button type="button" onClick={() => setIsSupplierModalOpen(true)} className="flex items-center w-full p-3 mt-1 text-left border-2 border-dashed rounded-lg text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-400"><User className="w-5 h-5 mr-3"/><span className="font-medium">Select a Supplier</span></button>)}
                                                    <FormikErrorMessage name="supplierId"/>
                                                </div>
                                                <div><label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-600">Purchase Date</label><div className="relative mt-1"><Calendar className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2"/><Field name="purchaseDate" type="date" className="w-full py-2 pl-10 pr-3 border-gray-300 rounded-lg"/></div></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div><label htmlFor="notes" className="block text-sm font-medium text-gray-600">Notes <span className="text-gray-400">(Optional)</span></label><div className="relative mt-1"><Field name="notes" as="textarea" rows="1" className="w-full py-2 pl-3 pr-3 border-gray-300 rounded-lg" placeholder="e.g., Delivery details..." /></div></div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white shadow-lg rounded-xl ring-1 ring-gray-900/5">
                                            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-slate-800">Purchase Items</h2><button type="button" onClick={() => setIsProductModalOpen(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2"/>Add Products</button></div>
                                            <FieldArray name="items">{({ remove }) => (<div className="overflow-x-auto"><table className="min-w-full">
                                                {values.items.length > 0 && <thead><tr><th className="py-2 text-xs font-semibold text-left text-gray-600">Product</th><th className="w-24 py-2 text-xs font-semibold text-center text-gray-600">Qty</th><th className="py-2 text-xs font-semibold text-right text-gray-600 w-28">Unit Cost</th><th className="py-2 text-xs font-semibold text-right text-gray-600 w-28">Total</th><th className="w-12 py-2"></th></tr></thead>}
                                                <tbody>
                                                    {values.items.length > 0 ? values.items.map((item, index) => (
                                                        <tr key={index} className="border-b">
                                                            <td className="py-2 text-sm text-gray-800">{item.name}</td>
                                                            <td className="py-2"><Field name={`items[${index}].quantity`} type="number" min="1" className="w-full p-1 text-center border-gray-300 rounded-md"/></td>
                                                            <td className="py-2"><Field name={`items[${index}].unitCost`} type="number" step="0.01" className="w-full p-1 text-right border-gray-300 rounded-md"/></td>
                                                            <td className="py-2 text-sm font-medium text-right text-gray-900">Rs. {(item.quantity * item.unitCost).toFixed(2)}</td>
                                                            <td className="py-2 text-right"><button type="button" onClick={() => remove(index)} className="p-1 text-red-500 rounded-full hover:bg-red-100"><Trash2 size={16}/></button></td>
                                                        </tr>
                                                    )) : <tr><td colSpan="5" className="py-10 text-center text-gray-500"><FileText className="inline-block w-8 h-8 mb-2"/><p>No products added yet.</p></td></tr>}
                                                </tbody>
                                            </table></div>)}</FieldArray>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <PurchaseSummary values={values} isCashPurchase={values.isCashPurchase} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SupplierSelectionModal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} />
                        <ProductSelectionModalForPurchase isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
                    </Form>
                );
            }}
        </Formik>
    );
};

export default CreatePurchasePage;