import { useEffect } from 'react';
import { useLocation } from '@/lib/router-compat';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Immediate scroll
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Additional scroll after a short delay to handle any async rendering
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
        
        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
