'use client';

import { useEffect, useRef, useState } from 'react';

export function useSyncedState<T>(
  source: T,
  isOpen: boolean,
  cardId: string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const prevIsOpenRef = useRef<boolean>(isOpen);
  const prevCardIdRef = useRef<string | null>(null);
  const prevSourceRef = useRef<T>(source);

  const [value, setValue] = useState(source);

  useEffect(() => {
    const cardChanged = cardId !== prevCardIdRef.current;
    const modalJustOpened = isOpen && !prevIsOpenRef.current;
    const sourceChanged = JSON.stringify(source) !== JSON.stringify(prevSourceRef.current);

    if (cardChanged || modalJustOpened || (isOpen && sourceChanged)) {
      prevCardIdRef.current = cardId;
      prevIsOpenRef.current = isOpen;
      prevSourceRef.current = source;
      const timeoutId = setTimeout(() => {
        setValue(source);
      }, 0);
      return () => clearTimeout(timeoutId);
    } else {
      prevIsOpenRef.current = isOpen;
      prevSourceRef.current = source;
    }
  }, [isOpen, cardId, source]);

  return [value, setValue];
}
