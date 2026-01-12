import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// Make sure this path is correct for your project structure
import { useCreateUser, useUpdateUserByAdmin } from '../../hooks/admin/useManageUser';
import { useAuthContext } from '../../auth/authProvider'; 

const UserForm = ({ user, onClose }) => {
  const isEditMode = !!user;

  const { user: currentUser } = useAuthContext();
  const isSelf = isEditMode && user?._id === currentUser?._id;

  const { mutate: createUser, isLoading: isCreating } = useCreateUser();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdateUserByAdmin();

  const initialValues = {
    fname: user?.fname || '',
    lname: user?.lname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    // These are only needed for 'create' mode but are safe to initialize for both
    password: '',
    confirmPassword: '',
  };

  // Define separate validation schemas for clarity
  const addModeSchema = Yup.object({
    fname: Yup.string().required('First name is required'),
    lname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    role: Yup.string().oneOf(['user', 'admin']).required('Role is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const editModeSchema = Yup.object({
    fname: Yup.string().required('First name is required'),
    lname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    role: Yup.string().oneOf(['user', 'admin']).required('Role is required'),
    // Password fields are not present in the form, so no validation is needed
  });

  const handleSubmit = (values, { setSubmitting, setStatus }) => {
    // We don't need to check for password in edit mode anymore,
    // as it's not part of the form.
    if (isEditMode) {
      // The `values` object will not contain password fields in edit mode
      updateUser({ id: user._id, data: values }, {
        onSuccess: () => onClose(),
        onError: (error) => {
            setStatus(error?.response?.data?.message || "Failed to update user.");
        },
        onSettled: () => setSubmitting(false),
      });
    } else {
      // In create mode, we need to remove confirmPassword before sending
      const { confirmPassword, ...createData } = values;
      createUser(createData, {
        onSuccess: () => onClose(),
        onSettled: () => setSubmitting(false),
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Formik
      initialValues={initialValues}
      // Choose the schema based on the mode
      validationSchema={isEditMode ? editModeSchema : addModeSchema}
      onSubmit={handleSubmit}
    >
      <Form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Field name="fname" placeholder="First Name" className="w-full p-2 border rounded" />
            <ErrorMessage name="fname" component="div" className="mt-1 text-sm text-red-500" />
          </div>
          <div>
            <Field name="lname" placeholder="Last Name" className="w-full p-2 border rounded" />
            <ErrorMessage name="lname" component="div" className="mt-1 text-sm text-red-500" />
          </div>
        </div>

        <div>
            <Field type="email" name="email" placeholder="Email" disabled={isEditMode} className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed" />
            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-500" />
        </div>
        
        <div>
            <Field name="phone" placeholder="Phone Number" className="w-full p-2 border rounded" />
            <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-500" />
        </div>
        
        <div>
            <Field 
                as="select" 
                name="role" 
                className="w-full p-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSelf}
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </Field>
            {isSelf && <div className="mt-1 text-xs text-orange-500">You cannot change your own role.</div>}
            <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-500" />
        </div>
        
        {/* --- SOLUTION: CONDITIONAL RENDERING --- */}
        {/* Only show these fields if we are NOT in edit mode */}
        {!isEditMode && (
          <>
            <div>
              <Field type="password" name="password" placeholder="Password" className="w-full p-2 border rounded" />
              <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-500" />
            </div>
            
            <div>
              <Field type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 border rounded" />
              <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-500" />
            </div>
          </>
        )}
        {/* --- END OF SOLUTION --- */}

        <div className="flex justify-end pt-4 space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 disabled:bg-orange-300">
            {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
          </button>
        </div>
      </Form>
    </Formik>
  );
};

export default UserForm;