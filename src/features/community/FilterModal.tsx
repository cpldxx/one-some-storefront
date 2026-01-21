import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValues: string[];
  onApply: (selected: string[]) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  title,
  options,
  selectedValues,
  onApply,
}: FilterModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);

  // 모달이 열릴 때마다 선택 상태 동기화
  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedValues);
    }
  }, [isOpen, selectedValues]);

  const handleToggle = (option: string) => {
    setLocalSelected((prev) =>
      prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option]
    );
  };

  const handleApply = () => {
    onApply(localSelected);
    onClose();
  };

  const handleReset = () => {
    setLocalSelected([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const isSelected = localSelected.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleToggle(option)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-3 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {localSelected.length > 0
              ? `${localSelected.length}개 선택 적용`
              : '적용하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
