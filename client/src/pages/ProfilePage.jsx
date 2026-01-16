import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProfile, useUpdateProfile, useUploadProfileImage, useChangePassword } from '../hooks/auth/useProfile';
import { toast } from 'react-toastify';
import { Camera, User, Mail, Phone, Save, Loader2, Check, AlertCircle, Crown, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6060/api";

const SkeletonLoader = () => (
    <div className="container p-4 mx-auto sm:p-6 md:p-8">
        <div className="w-1/3 h-8 mb-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col items-center p-8 space-y-4 border border-gray-200 bg-white rounded-2xl animate-pulse">
                <div className="w-40 h-40 bg-gray-300 rounded-full"></div>
                <div className="w-4/5 h-6 bg-gray-300 rounded-lg"></div>
                <div className="w-full h-4 bg-gray-200 rounded-lg"></div>
                <div className="w-1/3 h-4 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="p-8 border border-gray-200 bg-white rounded-2xl lg:col-span-2 animate-pulse">
                <div className="w-1/2 h-6 mb-8 bg-gray-200 rounded-lg"></div>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

const ProfilePage = () => {
  const { data: profileResponse, isLoading: isProfileLoading, isError } = useGetProfile();
  
  const { mutate: updateProfile, isLoading: isUpdating, isSuccess: isUpdateSuccess } = useUpdateProfile();
  const { mutate: uploadImage, isLoading: isUploading } = useUploadProfileImage();

  const [formData, setFormData] = useState({ fname: '', lname: '', phone: '' });
  const [buttonState, setButtonState] = useState('idle');
  const fileInputRef = useRef(null);
  
  // Password Change Logic
  const { mutate: changePassword, isLoading: isChangingPassword } = useChangePassword();
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handlePasswordChange = (e) => setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validatePassword = (password) => {
      // Min 8 chars, upper, lower, digit, special
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(password)) {
          return false;
      }
      // Check if password contains first or last name
      const lowerPassword = password.toLowerCase();
      if (user?.fname && lowerPassword.includes(user.fname.toLowerCase())) {
          return false;
      }
      if (user?.lname && lowerPassword.includes(user.lname.toLowerCase())) {
          return false;
      }
      return true;
  };

  const handlePasswordSubmit = (e) => {
      e.preventDefault();
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
          toast.error("All password fields are required.");
          return;
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
          toast.error("New passwords do not match.");
          return;
      }
      if (!validatePassword(passwordData.newPassword)) {
          toast.error("Password must be at least 8 chars with upper, lower, number, special char, and cannot contain your name.");
          return;
      }
      changePassword({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
      }, {
          onSuccess: () => {
              setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
          }
      });
  };


  useEffect(() => {
    if (profileResponse?.data) {
      const user = profileResponse.data;      
      setFormData({
        fname: user.fname || '',
        lname: user.lname || '',
        phone: user.phone || '',
      });
    }
  }, [profileResponse]);

  useEffect(() => {
    if (isUpdating) {
        setButtonState('loading');
    } else if (isUpdateSuccess) {
        setButtonState('success');
        const timer = setTimeout(() => setButtonState('idle'), 2000);
        return () => clearTimeout(timer);
    } else {
        setButtonState('idle');
    }
  }, [isUpdating, isUpdateSuccess]);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fname || !formData.lname) {
        toast.error("First name and last name are required.");
        return;
    }
    if (!formData.phone) {
        toast.error("Phone number is required.");
        return;
    }
    updateProfile(formData, {
        onError: (error) => {
            if (error.response?.status === 409) {
                toast.error(error.response.data.message || "Phone number already in use.");
            } else {
                toast.error("Failed to update profile.");
            }
        }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 2MB.");
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    uploadImage(fd);
  };

  if (isProfileLoading) return <SkeletonLoader />;
  if (isError) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-red-600">
        <AlertCircle size={48} />
        <p className="mt-4 text-xl font-semibold">Error loading profile.</p>
        <p>Please try refreshing the page.</p>
    </div>
  );

  const user = profileResponse.data;
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const filename = imagePath.split('/').pop();
    return `${API_URL}/uploads/${filename}`;
  };
  const imageUrl = getImageUrl(user?.profileImage);

  return (
    <div className="min-h-full p-4 bg-slate-50 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
            <p className="mt-1 text-slate-500">Manage your profile and security preferences.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="flex flex-col items-center p-8 text-center bg-white border shadow-sm border-slate-200 rounded-2xl h-fit">
              <div className="relative group mb-4">
                <div className="relative overflow-hidden rounded-full w-32 h-32 ring-4 ring-slate-50">
                    {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                    <div className="flex items-center justify-center w-full h-full font-bold text-white bg-indigo-600 text-5xl">
                        {user?.fname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    )}
                    {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2.5 text-white bg-slate-900 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
                    aria-label="Change profile picture"
                >
                    <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/jpg" className="hidden"/>
              </div>
            
            <h2 className="text-xl font-bold text-slate-900">{`${user.fname} ${user.lname}`}</h2>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            
            <div className="flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {user.role}
                </span>
                {user.subscription?.plan === 'PRO' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Crown size={12} className="mr-1"/> PRO
                    </span>
                )}
            </div>
          </div>

          <div className="space-y-8 lg:col-span-2">
            {/* Personal Details */}
            <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                </div>
               
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="fname" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <div className="relative">
                            <User className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                name="fname" 
                                id="fname" 
                                value={formData.fname} 
                                onChange={handleInputChange} 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lname" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <div className="relative">
                            <User className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                name="lname" 
                                id="lname" 
                                value={formData.lname} 
                                onChange={handleInputChange} 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                required 
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={user.email} 
                                disabled 
                                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 sm:text-sm cursor-not-allowed" 
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <button 
                    type="submit" 
                    disabled={buttonState !== 'idle'}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 min-w-[120px]"
                    >
                    {buttonState === 'loading' ? (
                        <>
                            <Loader2 size={16} className="mr-2 animate-spin" /> Saving...
                        </>
                    ) : buttonState === 'success' ? (
                        <>
                            <Check size={16} className="mr-2" /> Saved
                        </>
                    ) : (
                        <>
                            <Save size={16} className="mr-2" /> Save Changes
                        </>
                    )}
                    </button>
                </div>
                </form>
            </div>

            {/* Security */}
            <div className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-50">
                        <Lock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                        <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <div className="relative">
                        <KeyRound className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                        <input 
                        type={showOldPassword ? "text" : "password"} 
                        name="oldPassword" 
                        value={passwordData.oldPassword} 
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        placeholder="••••••••"
                        />
                        <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute text-slate-400 right-3 top-1/2 -translate-y-1/2 hover:text-slate-600"
                        >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                            type={showNewPassword ? "text" : "password"} 
                            name="newPassword" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordChange}
                            onFocus={() => setShowPasswordStrength(true)}
                            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                            placeholder="Min 8 chars..."
                            />
                            <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute text-slate-400 right-3 top-1/2 -translate-y-1/2 hover:text-slate-600"
                            >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {showPasswordStrength && <div className="mt-2"><PasswordStrengthMeter password={passwordData.newPassword} /></div>}
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                            <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            name="confirmNewPassword" 
                            value={passwordData.confirmNewPassword} 
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                            placeholder="Re-enter new password"
                            />
                            <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute text-slate-400 right-3 top-1/2 -translate-y-1/2 hover:text-slate-600"
                            >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        disabled={isChangingPassword}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-slate-900 border border-transparent rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-70 min-w-[140px]"
                    >
                        {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Update Password
                    </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;