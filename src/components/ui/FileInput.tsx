import { useRef, useState, type ChangeEvent } from 'react';

interface FileInputProps {
  label?: string;
  accept?: string;
  error?: string;
  onChange?: (file: File | null) => void;
  disabled?: boolean;
}

export function FileInput({
  label,
  accept = '.txt',
  error,
  onChange,
  disabled = false,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || null);
    onChange?.(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setFileName(null);
    onChange?.(null);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 w-full rounded-md border border-slate-300 px-3 py-2 bg-white ${
          error ? 'border-red-400' : ''
        } ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'}`}
        onClick={!disabled ? handleClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <div className="flex-1 text-sm text-slate-500 truncate">
          {fileName || 'Choose a file...'}
        </div>
        {fileName && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <span className="text-sm text-accent font-medium">Browse</span>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FileInput;
