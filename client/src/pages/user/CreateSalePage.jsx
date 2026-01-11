import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import CustomerSelectionModal from '../../components/sales/CustomerSelectionModal';
import ProductSelectionModal from '../../components/sales/ProductSelectionModal';
import { useCreateSale } from '../../hooks/useSale';
import { AuthContext } from '../../auth/authProvider';

import {
    ChevronLeft, User, Store, Plus, X, Trash2, Save, Loader2, FileText, CircleAlert, Calendar, BookText
} from 'lucide-react';

const saleValidationSchema = Yup.object().shape({
    isCashSale: Yup.boolean(),
    customerId: Yup.string().when('isCashSale', {
        is: false,
        then: schema => schema.required('A customer must be selected for credit sales.'),
        otherwise: schema => schema.notRequired(),
    }),
    items: Yup.array()
        .of(
            Yup.object().shape({
                quantity: Yup.number()
                    .min(1, 'Min 1')
                    .test(
                        'is-less-than-stock',
                        'Exceeds stock!',
                        function(value) {
                            const { stock } = this.parent;
                            return value <= stock;
                        }
                    )
                    .required(),
                productId: Yup.string().required(),
                name: Yup.string().required(),
                priceAtSale: Yup.number().required(),
                stock: Yup.number(),
            })
        )
        .min(1, 'Please add at least one product to the sale.'),
    
    amountPaid: Yup.number()
        .min(0, 'Amount paid cannot be negative.')
        .max(Yup.ref('grandTotal'), 'Amount paid cannot exceed the grand total.'),
});

const FormikErrorMessage = ({ name }) => (
    <ErrorMessage name={name}>
        {msg => <div className="flex items-center mt-1 text-xs text-red-600"><CircleAlert size={12} className="mr-1"/> {msg}</div>}
    </ErrorMessage>
);

const SaleSummary = ({ values, isCashSale }) => {
    const amountDue = values.grandTotal - values.amountPaid;
    return (
        <div className="sticky p-6 space-y-4 bg-white shadow-lg top-8 rounded-xl ring-1 ring-slate-900/5">
            <h2 className="pb-4 text-xl font-semibold text-gray-800 border-b">Order Summary</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium text-gray-800">Rs. {values.subTotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><label htmlFor="discount" className="text-gray-600">Discount (Rs.)</label><Field name="discount" type="number" className="w-24 p-1 text-right border-gray-300 rounded-md"/></div>
                <div className="flex items-center justify-between"><label htmlFor="tax" className="text-gray-600">Tax (Rs.)</label><Field name="tax" type="number" className="w-24 p-1 text-right border-gray-300 rounded-md"/></div>
            </div>
            <div className="pt-4 mt-2 border-t-2 border-dashed">
                <div className="flex justify-between text-lg font-bold text-gray-900"><span>Grand Total</span><span>Rs. {values.grandTotal.toFixed(2)}</span></div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                    <label htmlFor="amountPaid" className="font-medium text-gray-700">Amount Paid</label>
                    <Field
                        name="amountPaid"
                        type="number"
                        disabled={isCashSale}
                        className="p-1 font-semibold text-right border-gray-300 rounded-md w-28 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                </div>
                <FormikErrorMessage name="amountPaid" />
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-indigo-50">
                <span className="font-semibold text-indigo-800">Amount Due</span>
                <span className="font-bold text-indigo-800">Rs. {amountDue > 0 ? amountDue.toFixed(2) : '0.00'}</span>
            </div>
        </div>
    );
};

const CreateSalePage = () => {
    const navigate = useNavigate();
    const { currentShop } = useContext(AuthContext);
    const { mutate: createSale, isPending } = useCreateSale();
    
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    return (
        <Formik
            initialValues={{
                isCashSale: true, customerId: '', customerName: '', items: [],
                discount: 0, tax: 0, subTotal: 0, grandTotal: 0, amountPaid: 0,
                saleDate: new Date().toISOString().split('T')[0], notes: ''
            }}
            validationSchema={saleValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
                const finalSaleData = {
                    shopId: currentShop._id,
                    customerId: values.isCashSale ? null : values.customerId,
                    items: values.items.map(item => ({ productId: item.productId, quantity: Number(item.quantity), priceAtSale: Number(item.priceAtSale) })),
                    discount: Number(values.discount), tax: Number(values.tax), amountPaid: Number(values.amountPaid),
                    notes: values.notes, saleDate: values.saleDate,
                };
                createSale(finalSaleData, {
                    onSuccess: () => navigate('/sales'),
                    onSettled: () => setSubmitting(false)
                });
            }}
        >
            {({ values, setFieldValue, isSubmitting }) => {
                useEffect(() => {
                    const newSubTotal = values.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.priceAtSale)), 0);
                    setFieldValue('subTotal', newSubTotal);
                }, [values.items, setFieldValue]);

                useEffect(() => {
                    const newGrandTotal = values.subTotal - Number(values.discount) + Number(values.tax);
                    setFieldValue('grandTotal', newGrandTotal);
                }, [values.subTotal, values.discount, values.tax, setFieldValue]);

                useEffect(() => {
                    if (values.isCashSale) {
                        setFieldValue('amountPaid', values.grandTotal);
                    }
                }, [values.isCashSale, values.grandTotal, setFieldValue]);

                return (
                    <Form>
                        <div className="p-4 bg-slate-50 sm:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-200">
                                   <div className="flex items-center gap-4">
                                        <Link to="/sales" className="p-2 text-gray-500 transition-colors rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></Link>
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Sale</h1>
                                            <p className="mt-1 text-sm text-slate-500">Record a new transaction for your shop.</p>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting || isPending} className="inline-flex items-center justify-center w-40 px-4 py-3 text-sm font-medium text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:bg-gray-400">
                                        {isSubmitting || isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                        {isSubmitting || isPending ? 'Saving...' : 'Complete Sale'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                    {/* Left Column */}
                                    <div className="space-y-6 lg:col-span-2">
                                        <div className="p-6 bg-white shadow-lg rounded-xl ring-1 ring-gray-900/5">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-semibold text-gray-800">Customer & Details</h2>
                                                <div className="p-1 rounded-lg bg-slate-100">
                                                    <button type="button" onClick={() => setFieldValue('isCashSale', true)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${values.isCashSale ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cash Sale</button>
                                                    <button type="button" onClick={() => { setFieldValue('isCashSale', false); if(!values.customerId) setIsCustomerModalOpen(true); }} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${!values.isCashSale ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Credit Sale</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Billed To</label>
                                                    {values.isCashSale ? (
                                                        <div className="flex items-center p-3 mt-1 bg-gray-100 rounded-lg"><Store className="w-5 h-5 mr-3 text-gray-500"/><span className="font-medium text-gray-800">Walk-in Customer</span></div>
                                                    ) : values.customerId ? (
                                                        <div className="flex items-center justify-between p-3 mt-1 rounded-lg bg-blue-50">
                                                            <div className="flex items-center"><User className="w-5 h-5 mr-3 text-blue-600"/><span className="font-medium text-blue-800">{values.customerName}</span></div>
                                                            <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:underline">Change</button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="flex items-center w-full p-3 mt-1 text-left border-2 border-dashed rounded-lg text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-400">
                                                            <User className="w-5 h-5 mr-3"/><span className="font-medium">Select a Customer</span>
                                                        </button>
                                                    )}
                                                    <FormikErrorMessage name="customerId"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="saleDate" className="block text-sm font-medium text-gray-600">Sale Date</label>
                                                    <div className="relative mt-1">
                                                        <Calendar className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2"/>
                                                        <Field name="saleDate" type="date" className="w-full py-2 pl-10 pr-3 border-gray-300 rounded-lg"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label htmlFor="notes" className="block text-sm font-medium text-gray-600">Notes <span className="text-gray-400">(Optional)</span></label>
                                                <div className="relative mt-1">
                                                    <BookText className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2"/>
                                                    <Field name="notes" as="textarea" rows="2" className="w-full py-2 pl-10 pr-3 border-gray-300 rounded-lg" placeholder="e.g., Special instructions, reference number..." />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white shadow-lg rounded-xl ring-1 ring-gray-900/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-semibold text-slate-800">Sale Items</h2>
                                                <button type="button" onClick={() => setIsProductModalOpen(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2"/>Add Products</button>
                                            </div>
                                            <FieldArray name="items">
                                                {({ remove }) => (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full">
                                                            {values.items.length > 0 && <thead><tr><th className="py-2 text-xs font-semibold text-left text-gray-600">Product</th><th className="w-24 py-2 text-xs font-semibold text-center text-gray-600">Qty</th><th className="py-2 text-xs font-semibold text-right text-gray-600 w-28">Price</th><th className="py-2 text-xs font-semibold text-right text-gray-600 w-28">Total</th><th className="w-12 py-2"></th></tr></thead>}
                                                            <tbody>
                                                                {values.items.length > 0 ? values.items.map((item, index) => (
                                                                    <tr key={index} className="border-b">
                                                                        <td className="py-2 text-sm text-gray-800">
                                                                            {item.name}
                                                                            <FormikErrorMessage name={`items[${index}].quantity`} />
                                                                        </td>
                                                                        <td className="py-2">
                                                                            <Field name={`items[${index}].quantity`} type="number" min="1" className="w-full p-1 text-center border-gray-300 rounded-md"/>
                                                                        </td>
                                                                        <td className="py-2"><Field name={`items[${index}].priceAtSale`} type="number" step="0.01" className="w-full p-1 text-right border-gray-300 rounded-md"/></td>
                                                                        <td className="py-2 text-sm font-medium text-right text-gray-900">Rs. {(item.quantity * item.priceAtSale).toFixed(2)}</td>
                                                                        <td className="py-2 text-right"><button type="button" onClick={() => remove(index)} className="p-1 text-red-500 rounded-full hover:bg-red-100"><Trash2 size={16}/></button></td>
                                                                    </tr>
                                                                )) : <tr><td colSpan="5" className="py-10 text-center text-gray-500"><FileText className="inline-block w-8 h-8 mb-2"/><p>No products added yet.</p></td></tr>}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </FieldArray>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="lg:col-span-1">
                                        <SaleSummary values={values} isCashSale={values.isCashSale} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CustomerSelectionModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} />
                        <ProductSelectionModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
                    </Form>
                );
            }}
        </Formik>
    );
};

export default CreateSalePage;