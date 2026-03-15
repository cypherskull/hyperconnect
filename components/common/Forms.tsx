import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input {...props} ref={ref} className={`w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700 ${props.className}`} />
));

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
    <textarea {...props} ref={ref} className={`w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none ${props.className}`} />
));

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
    <select {...props} ref={ref} className={`w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none ${props.className}`}>
        {props.children}
    </select>
));

export const Label: React.FC<{ children: React.ReactNode, htmlFor?: string }> = ({ children, htmlFor }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{children}</label>
);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = "", variant = 'primary', ...props }, ref) => {
    const baseClasses = "flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: 'text-white bg-brand-primary hover:bg-brand-secondary',
        secondary: 'text-white bg-brand-secondary hover:bg-brand-secondary/80',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
    };

    return (
        <button ref={ref} {...props} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </button>
    );
});