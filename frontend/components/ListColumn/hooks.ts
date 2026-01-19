import { useEffect, useRef } from 'react';

/**
 * Hook to handle menu closing with click outside and escape key
 */
export const useMenuClose = (
  isOpen: boolean,
  onClose: () => void,
  menuRef: React.RefObject<HTMLElement>,
  buttonRef?: React.RefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isClickInMenu = menuRef.current?.contains(target);
      const isClickInButton = buttonRef?.current?.contains(target);
      
      if (!isClickInMenu && !isClickInButton) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, menuRef, buttonRef]);
};

/**
 * Hook to focus an element when a condition becomes true
 */
export const useFocusWhen = (condition: boolean, ref: React.RefObject<HTMLElement>, selectText = false) => {
  useEffect(() => {
    if (condition && ref.current) {
      ref.current.focus();
      if (selectText && 'select' in ref.current) {
        (ref.current as HTMLInputElement).select();
      }
    }
  }, [condition, ref, selectText]);
};
