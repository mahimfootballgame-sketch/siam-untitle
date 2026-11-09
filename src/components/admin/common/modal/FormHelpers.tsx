import React from 'react';

export interface FormSectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5 ${className}`}>
      {(title || description) && (
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60">
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            {title && <h4 className="text-xs font-black text-slate-900 tracking-tight">{title}</h4>}
            {description && <p className="text-[11px] text-slate-500 leading-normal">{description}</p>}
          </div>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500 font-black">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-medium">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
