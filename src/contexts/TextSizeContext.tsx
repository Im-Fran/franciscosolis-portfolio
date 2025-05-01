import React, { createContext, useState, useContext, useEffect } from 'react';

type TextSize = 'small' | 'normal' | 'large';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    // Recuperar del localStorage o usar 'normal' como valor predeterminado
    const savedSize = localStorage.getItem('textSize') as TextSize;
    return savedSize || 'normal';
  });

  useEffect(() => {
    // Guardar en localStorage y aplicar la clase al elemento raíz
    localStorage.setItem('textSize', textSize);
    document.documentElement.classList.remove('text-small', 'text-normal', 'text-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }, [textSize]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize debe usarse dentro de un TextSizeProvider');
  }
  return context;
};