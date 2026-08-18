import { useTextSize } from "@/legacy/contexts/TextSizeContext.tsx";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const TextSizeSelector = () => {
  const { textSize, setTextSize } = useTextSize();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="text-lg">Aa</span>
        <span className="sr-only">{t('common:change_text_size')}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
          <button
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              textSize === 'small' ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
            onClick={() => {
              setTextSize('small');
              setIsOpen(false);
            }}
          >
            <span className="text-sm">{t('common:text_size_small')}</span>
          </button>
          <button
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              textSize === 'normal' ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
            onClick={() => {
              setTextSize('normal');
              setIsOpen(false);
            }}
          >
            <span className="text-base">{t('common:text_size_normal')}</span>
          </button>
          <button
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              textSize === 'large' ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
            onClick={() => {
              setTextSize('large');
              setIsOpen(false);
            }}
          >
            <span className="text-lg">{t('common:text_size_large')}</span>
          </button>
        </div>
      )}
    </div>
  );
};