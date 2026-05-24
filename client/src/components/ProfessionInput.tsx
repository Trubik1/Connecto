import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ProfessionInput({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allProfessions, setAllProfessions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/users/professions/list')
      .then(res => setAllProfessions(res.data))
      .catch(err => console.error('Failed to load professions:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    if (inputValue.length > 0) {
      const filtered = allProfessions.filter(prof =>
        prof.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (profession: string) => {
    onChange(profession);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Профессия (начните вводить)"}
        className="input-field"
        value={value}
        onChange={handleChange}
        onFocus={() => value.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-mint-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((prof, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-mint-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              onClick={() => handleSelect(prof)}
            >
              {prof}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}