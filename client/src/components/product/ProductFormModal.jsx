import React, { useState, useEffect, useRef, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAddProduct, useUpdateProduct } from '../../hooks/useProduct'; 
import { AuthContext } from '../../auth/authProvider'; 
import {
  X,
  Package,
  DollarSign,
  Hash,
  Layers,
  UploadCloud,
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';


const productValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Product name is required.'),
  description: Yup.string().max(500, 'Description cannot exceed 500 characters.'),
  category: Yup.string().required('Category is required.'),
  sellingPrice: Yup.number()
    .min(0, 'Selling price cannot be negative')
    .required('Selling price is required.')
    .test(
      'is-greater',
      'Selling price must be >= purchase price',
      function (value) {
        const { purchasePrice } = this.parent;
        return value >= purchasePrice;
      }
    ),
  purchasePrice: Yup.number()
    .min(0, 'Purchase price cannot be negative')
    .required('Purchase price is required.'),
  quantity: Yup.number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .required('Stock quantity is required.'),
  reorderLevel: Yup.number()
    .integer('Reorder level must be a whole number')
    .min(0, 'Reorder level cannot be negative')
    .required('Reorder level is required.'),
  productImage: Yup.mixed().nullable(), 
});

const productCategories = [
  'Groceries & Food',
  'Beverages',
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Health & Personal Care',
  'Home & Kitchen',
  'Furniture & Decor',
  'Books & Stationery',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive & Tools',
  'Pet Supplies',
  'Beauty & Cosmetics',
  'Office Supplies',
  'Other',
];

const FormInput = ({ label, name, formik, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Icon className="w-5 h-5 text-slate-400" /></span>}
      <input
        id={name}
        name={name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        className={`block w-full py-2.5 ${Icon ? 'pl-10' : 'px-3'} pr-3 text-sm text-slate-800 bg-slate-50 rounded-lg border transition-all
        ${formik.touched[name] && formik.errors[name]
            ? 'border-rose-500 focus:ring-rose-500/50'
            : 'border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
        {...props}
      />
    </div>
    {formik.touched[name] && formik.errors[name] && (
      <div className="flex items-center mt-1.5 text-xs text-red-600">
        <AlertCircle size={14} className="mr-1" />
        {formik.errors[name]}
      </div>
    )}
  </div>
);

const FormTextarea = ({ label, name, formik, ...props }) => (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={name}
        name={name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        className={`block w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-lg border transition-all
        ${formik.touched[name] && formik.errors[name]
            ? 'border-rose-500 focus:ring-rose-500/50'
            : 'border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <div className="flex items-center mt-1.5 text-xs text-red-600">
          <AlertCircle size={14} className="mr-1" />
          {formik.errors[name]}
        </div>
      )}
    </div>
);

// Add this new component to your file
const FormSelect = ({ label, name, formik, icon: Icon, children, ...props }) => (
    <div>
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {Icon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon className="w-5 h-5 text-slate-400" /></span>}
        <select
          id={name}
          name={name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          className={`block w-full py-2.5 ${Icon ? 'pl-10' : 'px-3'} pr-10 text-sm text-slate-800 bg-slate-50 rounded-lg border transition-all appearance-none
          ${formik.touched[name] && formik.errors[name]
              ? 'border-rose-500 focus:ring-rose-500/50'
              : 'border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
          {...props}
        >
          {children}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
           {/* Dropdown Arrow */}
           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </div>
      {formik.touched[name] && formik.errors[name] && (
        <div className="flex items-center mt-1.5 text-xs text-red-600">
          <AlertCircle size={14} className="mr-1" />
          {formik.errors[name]}
        </div>
      )}
    </div>
);

const ProductFormModal = ({ isOpen, onClose, productToEdit }) => {
  const { mutate: addProduct, isPending: isAdding } = useAddProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { currentShop } = useContext(AuthContext);

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(productToEdit);
  const isProcessing = isAdding || isUpdating;

  const formik = useFormik({
    initialValues: {
      name: productToEdit?.name || '',
      description: productToEdit?.description || '',
      category: productToEdit?.category || '',
      purchasePrice: productToEdit?.purchasePrice || 0,
      sellingPrice: productToEdit?.sellingPrice || 0,
      quantity: productToEdit?.quantity || 0,
      reorderLevel: productToEdit?.reorderLevel || 5,
      productImage: null,
    },
    validationSchema: productValidationSchema,
    enableReinitialize: true, 
    onSubmit: (values) => {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'productImage') {
          formData.append(key, values[key]);
        }
      });
      if (values.productImage instanceof File) {
        formData.append('productImage', values.productImage);
      }

      if (isEditMode) {
        updateProduct({ id: productToEdit._id, data: formData }, {
          onSuccess: () => onClose(), 
        });
      } else {
        formData.append('shopId', currentShop._id);
        addProduct(formData, {
          onSuccess: () => onClose(), 
        });
      }
    },
  });

  useEffect(() => {
    if (isEditMode && productToEdit?.imageUrl) {
      setImagePreview(productToEdit.imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [productToEdit, isEditMode]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('productImage', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onMouseDown={handleClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl transform transition-all" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Update Product' : 'Add New Product'}</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Image Section */}
              <div className="md:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">Product Image</label>
                <div
                  className="relative flex items-center justify-center w-full h-48 bg-gray-100 border-2 border-dashed rounded-lg cursor-pointer hover:border-orange-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product Preview" className="object-cover w-full h-full rounded-lg" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto" />
                      <p className="mt-2 text-sm">Click to upload</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="productImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Fields Section */}
              <div className="grid grid-cols-1 gap-5 md:col-span-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormInput label="Product Name" name="name" formik={formik} icon={Package} type="text" placeholder="e.g. Organic Coffee Beans" />
                </div>
            <div className="sm:col-span-2">
              <FormSelect
                    label="Category"
                    name="category"
                    formik={formik}
                    icon={Layers}
                >
                    <option value="" disabled>Select a category</option>
                    {productCategories.map(category => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                    ))}
                </FormSelect>
                </div>
                <div className="sm:col-span-2">
                <FormTextarea
                    label="Description"
                    name="description"
                    formik={formik}
                    rows="3"
                    placeholder="Briefly describe the product..."
                />
                </div>
                <FormInput label="Selling Price (₹)" name="sellingPrice" formik={formik} icon={DollarSign} type="number" step="0.01" />
                <FormInput label="Purchase Price (₹)" name="purchasePrice" formik={formik} icon={DollarSign} type="number" step="0.01" />
                <FormInput label="Stock Quantity" name="quantity" formik={formik} icon={Hash} type="number" />
                <FormInput label="Reorder Level" name="reorderLevel" formik={formik} icon={Hash} type="number" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end p-6 border-t">
            <button type="button" onClick={handleClose} className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isProcessing && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;