import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetShops, useSelectActiveShop } from "../hooks/useShop";
import { socket } from "../socket";
import SwitchingShopOverlay from "../components/ui/SwitchingShopOverlay";
import LogoutOverlay from "../components/ui/LogoutOverlay";
import { toast } from "react-toastify";
import { getProfileService, logoutUserService } from "../services/authService";

export const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); 
    const [isSwitchingShop, setIsSwitchingShop] = useState(false); 
    const [switchingToShopName, setSwitchingToShopName] = useState(''); 
    const [toastInfo, setToastInfo] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    
    const [currentShopId, setCurrentShopId] = useState(() => 
        localStorage.getItem("currentShopId")
    );

    const queryClient = useQueryClient();
    const { data: shops, isLoading: shopsLoading } = useGetShops();

    const { mutate: switchShopMutation } = useSelectActiveShop();

    const currentShop = useMemo(() => {
        if (shopsLoading || !shops) {
            return null;
        }
        
        if (Array.isArray(shops) && currentShopId) {
            return shops.find(s => s._id === currentShopId);
        }
        return Array.isArray(shops) && shops.length > 0 ? shops[0] : null;
    }, [shops, currentShopId, shopsLoading]);
    
    useEffect(() => {
        if (!currentShopId && !shopsLoading && Array.isArray(shops) && shops.length > 0) {
            setCurrentShopId(shops[0]._id);
        }
    }, [shops, currentShopId, shopsLoading]);

    useEffect(() => {
        if (user?._id) {
            socket.connect();
            socket.emit('joinRoom', user._id);
        } else {
            socket.disconnect();
        }
        return () => { socket.disconnect(); };
    }, [user]);

    const login = useCallback((loginData) => {
        const { data } = loginData;
        const { user: userData, currentShopId: initialShopId } = data;

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        if (initialShopId) {
            localStorage.setItem("currentShopId", initialShopId);
            setCurrentShopId(initialShopId);
        }
        
        queryClient.invalidateQueries({ queryKey: ['shops'] });
    }, [queryClient]);

    const logout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            // Call backend to clear httpOnly cookie
            await logoutUserService();
        } catch (error) {
            console.warn('Backend logout failed:', error);
        }

        try {
            socket.disconnect();
        } catch (error) {
            console.warn('Socket disconnect error:', error);
        }
        try {
            queryClient.clear();
            queryClient.resetQueries();
        } catch (error) {
            console.warn('Query cache clear error:', error);
        }
        
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("currentShopId");
        } catch (error) {
            console.warn('LocalStorage clear error:', error);
        }
        //clear session storage
        sessionStorage.clear();

        
        setUser(null);
        setCurrentShopId(null);
        setIsSwitchingShop(false);
        setSwitchingToShopName('');
        setToastInfo(null);
        
        setTimeout(() => {
            setIsLoggingOut(false);
            window.location.href = '/login'; // Redirect to login page instead of reload
        }, 500); 
    }, [queryClient]);

    const showQueuedToast = () => {
        if (toastInfo) {
            if (toastInfo.type === 'success') {
                toast.success(toastInfo.message);
            } else if (toastInfo.type === 'error') {
                toast.error(toastInfo.message);
            }
            setToastInfo(null);
        }
    };

    const switchShop = useCallback(async (shopId) => {
        if (shopsLoading || !Array.isArray(shops)) return;
        
        const targetShop = shops.find(s => s._id === shopId);
        if (!targetShop) return;

        setSwitchingToShopName(targetShop.name);
        setIsSwitchingShop(true);
        setCurrentShopId(shopId);
        localStorage.setItem("currentShopId", shopId);
        
        switchShopMutation(shopId, {
            onSuccess: () => {
                // DON'T show toast yet. Just queue it.
                setToastInfo({ type: 'success', message: `Successfully switched to ${targetShop.name}` });

                queryClient.invalidateQueries();
                setTimeout(() => {
                    setIsSwitchingShop(false);
                }, 3000); // Increased delay to let the cool animation play out
            },
            onError: (error) => {
                // Queue the error toast and hide the overlay immediately
                setToastInfo({ type: 'error', message: error.message || "Failed to switch shop." });
                setIsSwitchingShop(false);
                // Revert logic remains the same
                const previousShopId = currentShop?._id || null;
                setCurrentShopId(previousShopId);
                // ... etc ...
            }
        });
    }, [queryClient, switchShopMutation, currentShop, shops, shopsLoading, setToastInfo]);
    
    useEffect(() => {
        const checkAuth = async () => {
             const storedUser = localStorage.getItem("user");
            
             if (storedUser) {
                 setUser(JSON.parse(storedUser));
                 setAuthLoading(false);
             } else {
                // Try to fetch profile from backend (in case of OAuth redirect or persistent cookie)
                try {
                    const response = await getProfileService();
                    if (response && response.data) {
                        const userData = response.data;
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                        
                        // Set active shop if exists
                        if(userData.activeShop){
                             localStorage.setItem("currentShopId", userData.activeShop._id || userData.activeShop);
                             setCurrentShopId(userData.activeShop._id || userData.activeShop);
                        } else if (userData.shops && userData.shops.length > 0) {
                             localStorage.setItem("currentShopId", userData.shops[0]._id);
                             setCurrentShopId(userData.shops[0]._id);
                        }
                    }
                } catch (error) {
                    // Auth check failed or no session
                } finally {
                    setAuthLoading(false);
                }
             }
        }
        
        checkAuth();
    }, []); 

    const loading = authLoading || (!!user && shopsLoading);

    // Don't show loading if we're logging out
    const shouldShowLoading = loading && !isLoggingOut;

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                shops: Array.isArray(shops) ? shops : [], 
                currentShop,
                loading: shouldShowLoading,
                login,
                logout,
                switchShop,
                isAuthenticated: !!user,
                isLoggingOut,
            }}
        >
            <SwitchingShopOverlay 
                isVisible={isSwitchingShop} 
                shopName={switchingToShopName} 
                onExitComplete={showQueuedToast}
            />
            <LogoutOverlay 
                isVisible={isLoggingOut} 
                onExitComplete={() => setIsLoggingOut(false)}
            />
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;