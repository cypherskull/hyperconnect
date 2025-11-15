import React, { useState, useRef, KeyboardEvent } from 'react';
import { CloseIcon } from '../common/Icons';

interface OtpModalProps {
  emailToVerify: string;
  onClose: () => void;
  onVerifySuccess: () => void;
}

const CORRECT_OTP = '123456';

export const OtpModal: React.FC<OtpModalProps> = ({ emailToVerify, onClose, onVerifySuccess }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp === CORRECT_OTP) {
      onVerifySuccess();
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Verify Email</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code sent to <span className="font-semibold">{emailToVerify}</span>.
            <br/>(Hint: it's {CORRECT_OTP})
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputsRef.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-bold border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
              />
            ))}
          </div>
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-3 px-4 rounded-md text-center bg-brand-primary text-white font-semibold hover:bg-brand-secondary transition-colors">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};