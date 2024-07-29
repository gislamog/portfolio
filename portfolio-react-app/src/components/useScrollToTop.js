import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = (pathsToScroll) => {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathsToScroll.includes(pathname)) {
            window.scrollTo(0, 0);
        }
    }, [pathname, pathsToScroll]);
};

export default useScrollToTop;
