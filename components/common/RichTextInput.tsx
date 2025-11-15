import React, { useRef } from 'react';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{children}</label>
);

export const RichTextInput: React.FC<{ label: string; value: string; onChange: (value: string) => void, rows?: number }> = ({ label, value, onChange, rows = 4 }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFormat = (tag: 'b' | 'i' | 'ul') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        let newText = '';
        if (tag === 'ul') {
            const listItems = selectedText.split('\n').map(line => `<li>${line.trim() ? line : '&nbsp;'}</li>`).join('');
            newText = `<ul>\n${listItems}\n</ul>`;
        } else {
            newText = `<${tag}>${selectedText}</${tag}>`;
        }
        onChange(value.substring(0, start) + newText + value.substring(end));
    };
    
    return (
        <div>
            {label && <Label>{label}</Label>}
            <div className="border border-brand-border rounded-md">
                <div className="p-1 bg-brand-card-light border-b border-brand-border flex space-x-1">
                    <button type="button" onClick={() => handleFormat('b')} className="px-2 py-1 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 rounded">B</button>
                    <button type="button" onClick={() => handleFormat('i')} className="px-2 py-1 text-sm italic hover:bg-gray-300 dark:hover:bg-gray-600 rounded">I</button>
                    <button type="button" onClick={() => handleFormat('ul')} className="px-2 py-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 rounded">List</button>
                </div>
                <textarea 
                    ref={textareaRef} 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    rows={rows} 
                    className="w-full p-2 bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none rounded-b-md" 
                />
            </div>
        </div>
    )
};
