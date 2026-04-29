import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, User, MapPin, Package, Heart, Settings, LogOut, Plus, Edit2, Check, ChevronRight } from 'lucide-react';
import { TextSpinner } from '@/components/ui/text-spinner';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { products } from '@/data/products';
import { formatMoney } from '@/lib/money';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'payment-status';

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [removeWishlistProductId, setRemoveWishlistProductId] = useState<string | null>(null);

  const [profileErrors, setProfileErrors] = useState<{ full_name?: string; phone?: string }>({});
  const [addressErrors, setAddressErrors] = useState<Partial<Record<
    'full_name' | 'address_line1' | 'city' | 'state_province' | 'postal_code' | 'country' | 'phone',
    string
  >>>({});
  const navigate = useNavigate();
  const params = useParams();
  const { user, profile, addresses, orders, wishlistIds, loading: authLoading, signOut, signingOut, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, addToWishlist, removeFromWishlist, refreshAddresses, refreshOrders } = useAuth();
  const tabFromUrl = (params.tab as Tab | undefined) || 'profile';
  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, isOpen]);

  // Rehydrate tab data from DB (single source of truth) once session is available.
  useEffect(() => {
    if (!isOpen || !user) return;
    if (authLoading) return;

    if (activeTab === 'addresses') {
      refreshAddresses()
        .then(({ error }) => setAddressesLoadError(error ? (error.message || 'Failed to load addresses') : null))
        .catch((e) => setAddressesLoadError(e?.message || 'Failed to load addresses'));
    }

    if (activeTab === 'orders') {
      refreshOrders()
        .then(({ error }) => setOrdersLoadError(error ? (error.message || 'Failed to load orders') : null))
        .catch((e) => setOrdersLoadError(e?.message || 'Failed to load orders'));
    }
  }, [activeTab, authLoading, isOpen, refreshAddresses, refreshOrders, user]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressesLoadError, setAddressesLoadError] = useState<string | null>(null);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false
  });

  // Close modal if user signs out or becomes null
  useEffect(() => {
    if (isOpen && !user && !signingOut) {
      onClose();
    }
  }, [user, isOpen, signingOut, onClose]);

  if (!isOpen || !user) return null;

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  const validatePhone = (value: string): string | null => {
    const v = value.trim();
    if (!v) return null;
    // Very light validation: digits plus common separators.
    if (!/^[+()\-\s\d]{7,}$/.test(v)) return 'Enter a valid phone number';
    return null;
  };

  const validateProfile = () => {
    const next: { full_name?: string; phone?: string } = {};
    if (!profileForm.full_name.trim()) next.full_name = 'Full name is required';
    const phoneErr = validatePhone(profileForm.phone);
    if (phoneErr) next.phone = phoneErr;
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateAddress = () => {
    const next: typeof addressErrors = {};
    if (!addressForm.full_name.trim()) next.full_name = 'Full name is required';
    if (!addressForm.address_line1.trim()) next.address_line1 = 'Address line 1 is required';
    if (!addressForm.city.trim()) next.city = 'City is required';
    if (!addressForm.state_province.trim()) next.state_province = 'State/Province is required';
    if (!addressForm.postal_code.trim()) next.postal_code = 'Postal code is required';
    if (!addressForm.country.trim()) next.country = 'Country is required';
    const phoneErr = validatePhone(addressForm.phone);
    if (phoneErr) next.phone = phoneErr;
    setAddressErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfile()) return;

    setLoading(true);

    try {
      const { error } = await updateProfile(profileForm);
      if (error) {
        console.error('Failed to update profile:', error);
        toast({
          title: 'Unable to save profile',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!validateAddress()) return;

    setLoading(true);

    try {
      const { error } = await addAddress(addressForm);

      if (error) {
        console.error('Failed to add address:', error);
        toast({
          title: 'Unable to save address',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setShowAddressForm(false);
      setAddressErrors({});
      resetAddressForm();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddressId) return;
    if (!validateAddress()) return;

    setLoading(true);

    try {
      const { error } = await updateAddress(editingAddressId, addressForm);

      if (error) {
        console.error('Failed to update address:', error);
        toast({
          title: 'Unable to update address',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setEditingAddressId(null);
      setAddressErrors({});
      resetAddressForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setDeleteAddressId(id);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressId) return;
    try {
      const { error } = await deleteAddress(deleteAddressId);
      if (error) {
        toast({
          title: 'Unable to delete address',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Address deleted',
        description: 'The address has been removed from your account.',
      });
    } finally {
      setDeleteAddressId(null);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: false
    });
  };

  const startEditAddress = (address: any) => {
    setAddressForm({
      full_name: address.full_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default
    });
    setEditingAddressId(address.id);
  };

  const handleSignOut = async () => {
    // Prevent action if already signing out
    if (signingOut) return;

    try {
      const { error } = await signOut();
      
      if (error) {
        // Show error to user (you can use a toast/alert component here)
        console.error('Failed to sign out:', error);
        toast({
          title: 'Sign out failed',
          description: 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Close the modal immediately on successful sign out.
      // AuthContext has already cleared user data.
      onClose();
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'payment-status' as Tab, label: 'Payment Status', icon: Settings },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const confirmRemoveWishlistItem = async () => {
    if (!removeWishlistProductId) return;

    const removedId = removeWishlistProductId;
    const removedProduct = products.find((p) => p.id === removedId);

    try {
      const { error } = await removeFromWishlist(removedId);
      if (error) {
        toast({
          title: 'Unable to update wishlist',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Removed from wishlist',
        description: removedProduct?.name ? `${removedProduct.name} was removed.` : 'The item has been removed from your wishlist.',
        duration: 6000,
        action: (
          <ToastAction
            altText="Undo remove"
            onClick={async () => {
              const { error: undoError } = await addToWishlist(removedId);
              if (undoError) {
                toast({
                  title: 'Unable to undo',
                  description: undoError.message || 'Please try again.',
                  variant: 'destructive',
                });
                return;
              }
              toast({
                title: 'Restored',
                description: removedProduct?.name ? `${removedProduct.name} is back in your wishlist.` : 'Item restored to your wishlist.',
                duration: 2500,
              });
            }}
          >
            Undo
          </ToastAction>
        ),
      });
    } finally {
      setRemoveWishlistProductId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{profile?.full_name || 'My Account'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(92vh-80px)] sm:h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-900 p-3 sm:p-4 flex flex-col">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible flex-1 md:space-y-1 pb-1 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/account/${tab.id}`);
                  }}
                  className={`whitespace-nowrap md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'wishlist' && wishlistIds.length > 0 && (
                    <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistIds.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {signingOut ? (
                <TextSpinner label="Signing out..." />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setProfileForm({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || ''
                        });
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, full_name: e.target.value });
                          if (profileErrors.full_name) setProfileErrors((p) => ({ ...p, full_name: undefined }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          profileErrors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${profileErrors.full_name ? 'text-red-600' : 'text-gray-500'}`}>
                        {profileErrors.full_name ?? 'Use your real name for deliveries and support.'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, phone: e.target.value });
                          if (profileErrors.phone) setProfileErrors((p) => ({ ...p, phone: undefined }));
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          profileErrors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${profileErrors.phone ? 'text-red-600' : 'text-gray-500'}`}>
                        {profileErrors.phone ?? 'Optional. Used for delivery updates.'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
                      >
                        {loading ? <TextSpinner label="Saving..." /> : <Check className="w-4 h-4" />}
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{profile?.full_name || 'Not set'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.email}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{profile?.phone || 'Not set'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Addresses</h3>
                  {!showAddressForm && !editingAddressId && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Address
                    </button>
                  )}
                </div>

                {(showAddressForm || editingAddressId) && (
                  <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 sm:p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {editingAddressId ? 'Edit Address' : 'New Address'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={addressForm.full_name}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, full_name: e.target.value });
                            if (addressErrors.full_name) setAddressErrors((p) => ({ ...p, full_name: undefined }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.full_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${addressErrors.full_name ? 'text-red-600' : 'text-gray-500'}`}>
                          {addressErrors.full_name ?? 'Name on the delivery address.'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Address</label>
                        <input
                          type="text"
                          value={addressForm.address_line1}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, address_line1: e.target.value });
                            if (addressErrors.address_line1) setAddressErrors((p) => ({ ...p, address_line1: undefined }));
                          }}
                          placeholder="Street / House number"
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.address_line1 ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${addressErrors.address_line1 ? 'text-red-600' : 'text-gray-500'}`}>
                          {addressErrors.address_line1 ?? 'Where should we deliver this order?'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Apt, Suite, etc. (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.address_line2}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                          value={addressForm.city}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, city: e.target.value });
                            if (addressErrors.city) setAddressErrors((p) => ({ ...p, city: undefined }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select sub city</option>
                          <option value="Addis Ketema">Addis Ketema</option>
                          <option value="Akaky Kaliti">Akaky Kaliti</option>
                          <option value="Arada">Arada</option>
                          <option value="Bole">Bole</option>
                          <option value="Gulele">Gulele</option>
                          <option value="Kirkos">Kirkos</option>
                          <option value="Kolfe Keraniyo">Kolfe Keraniyo</option>
                          <option value="Lideta">Lideta</option>
                          <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                          <option value="Yeka">Yeka</option>
                          <option value="Lemi Kura">Lemi Kura</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Province/State</label>
                        <select
                          value={addressForm.state_province}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, state_province: e.target.value });
                            if (addressErrors.state_province) setAddressErrors((p) => ({ ...p, state_province: undefined }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.state_province ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select province/state</option>
                          <option value="Addis Ababa">Addis Ababa</option>
                          <option value="Afar">Afar</option>
                          <option value="Amhara">Amhara</option>
                          <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                          <option value="Dire Dawa">Dire Dawa</option>
                          <option value="Gambela">Gambela</option>
                          <option value="Harari">Harari</option>
                          <option value="Oromia">Oromia</option>
                          <option value="Sidama">Sidama</option>
                          <option value="Somali">Somali</option>
                          <option value="Southwest Ethiopia">Southwest Ethiopia</option>
                          <option value="Tigray">Tigray</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, postal_code: e.target.value });
                            if (addressErrors.postal_code) setAddressErrors((p) => ({ ...p, postal_code: undefined }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.postal_code ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${addressErrors.postal_code ? 'text-red-600' : 'text-gray-500'}`}>
                          {addressErrors.postal_code ?? 'Postal code helps ensure accurate delivery.'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Country</label>
                        <select
                          value={addressForm.country}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, country: e.target.value });
                            if (addressErrors.country) setAddressErrors((p) => ({ ...p, country: undefined }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.country ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select country</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, phone: e.target.value });
                            if (addressErrors.phone) setAddressErrors((p) => ({ ...p, phone: undefined }));
                          }}
                          placeholder="+251 ..."
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            addressErrors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${addressErrors.phone ? 'text-red-600' : 'text-gray-500'}`}>
                          {addressErrors.phone ?? 'Optional. Used for delivery updates.'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200">Set as default address</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={editingAddressId ? handleUpdateAddress : handleAddAddress}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
                      >
                        {loading ? <TextSpinner label={editingAddressId ? "Updating..." : "Saving..."} /> : <Check className="w-4 h-4" />}
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                          setAddressErrors({});
                          resetAddressForm();
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {authLoading ? (
                  <div className="text-center py-12">
                    <TextSpinner label="Loading addresses..." />
                  </div>
                ) : addressesLoadError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 flex items-center justify-between">
                    <div className="text-sm">{addressesLoadError}</div>
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await refreshAddresses();
                        setAddressesLoadError(error ? (error.message || 'Failed to load addresses') : null);
                      }}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 relative">
                        {address.is_default && (
                          <span className="absolute top-4 right-4 bg-indigo-200 text-indigo-900 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-300">
                            Default
                          </span>
                        )}
                        <div className="font-medium text-gray-900 dark:text-gray-100">{address.full_name}</div>
                        <div className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {address.address_line1}
                          {address.address_line2 && <>, {address.address_line2}</>}
                          <br />
                          {address.city}, {address.state_province} {address.postal_code}
                          <br />
                          {address.country}
                        </div>
                        {address.phone && (
                          <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{address.phone}</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => startEditAddress(address)}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {!address.is_default && (
                            <button
                              onClick={() => setDefaultAddress(address.id)}
                              className="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order History</h3>
                {authLoading ? (
                  <div className="text-center py-12">
                    <TextSpinner label="Loading orders..." />
                  </div>
                ) : ordersLoadError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 flex items-center justify-between">
                    <div className="text-sm">{ordersLoadError}</div>
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await refreshOrders();
                        setOrdersLoadError(error ? (error.message || 'Failed to load orders') : null);
                      }}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Order</span>
                            <span className="text-gray-500 text-sm ml-3">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-mono text-xs break-all">{order.id}</span>
                          {order.is_mock && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              MOCK
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {order.metadata?.amount ? `$${order.metadata.amount}` : '—'}
                            {order.metadata?.currency ? ` ${order.metadata.currency}` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(order.id);
                              } catch {
                                // ignore
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                          >
                            Copy ID
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Status Tab */}
            {activeTab === 'payment-status' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Status</h3>
                <p className="text-gray-600 mb-4">
                  View backend-confirmed payment status.
                </p>
                <a
                  href="/payment-status"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium"
                >
                  Go to Payment Status Page
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h3>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 flex gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</h4>
                          <p className="text-indigo-600 font-semibold mt-1">{formatMoney(product.price, product.currency)}</p>
                          <button
                            onClick={() => setRemoveWishlistProductId(product.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
      </div>

      <AlertDialog
        open={!!deleteAddressId}
        onOpenChange={(open) => {
          if (!open) setDeleteAddressId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAddressId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteAddress}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!removeWishlistProductId}
        onOpenChange={(open) => {
          if (!open) setRemoveWishlistProductId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the item from your wishlist.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveWishlistProductId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemoveWishlistItem}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountModal;
