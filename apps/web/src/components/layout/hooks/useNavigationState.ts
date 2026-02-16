import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isPathActive, MENU_SECTIONS } from '../handlers/nav.handler';

export function useNavigationState() {
  const { pathname } = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Automatically expand parent menu if a child path is active
  useEffect(() => {
    const activeParents: string[] = [];
    MENU_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(child => pathname.startsWith(child.path))) {
          activeParents.push(item.label);
        }
      });
    });
    
    if (activeParents.length > 0) {
      setExpandedMenus(prev => {
        const next = [...prev];
        activeParents.forEach(p => {
          if (!next.includes(p)) next.push(p);
        });
        return next;
      });
    }
  }, [pathname]);

  const toggleMenu = useCallback((label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  }, []);

  const isActive = useCallback((path?: string) => {
    return isPathActive(pathname, path);
  }, [pathname]);

  return {
    pathname,
    expandedMenus,
    toggleMenu,
    isActive,
    menuSections: MENU_SECTIONS
  };
}
