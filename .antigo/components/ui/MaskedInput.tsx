import React, { forwardRef } from 'react';
import { useMask } from '@/hooks/useMask';
import { MaskType } from '@/types';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /**
   * Tipo de máscara a ser aplicada
   */
  mask: MaskType;
  /**
   * Valor controlado do input
   */
  value?: string;
  /**
   * Callback executado quando o valor muda
   * @param maskedValue - Valor com máscara aplicada
   * @param unmaskedValue - Valor sem máscara (apenas números/caracteres válidos)
   */
  onChange?: (maskedValue: string, unmaskedValue: string) => void;
  /**
   * Label do campo
   */
  label?: string;
  /**
   * Mensagem de erro
   */
  error?: string;
  /**
   * Texto de ajuda
   */
  helperText?: string;
  /**
   * Se deve mostrar ícone de validação
   */
  showValidation?: boolean;
  /**
   * Função de validação customizada
   */
  validator?: (value: string) => boolean;
  /**
   * Classes CSS customizadas
   */
  className?: string;
  /**
   * Classes CSS do container
   */
  containerClassName?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(({
  mask,
  value,
  onChange,
  label,
  error,
  helperText,
  showValidation = false,
  validator,
  className = '',
  containerClassName = '',
  disabled,
  required,
  placeholder,
  ...props
}, ref) => {
  const {
    value: maskedValue,
    unmaskedValue,
    inputProps,
    setValue
  } = useMask({
    mask,
    initialValue: value || '',
    onChange: (masked, unmasked) => {
      onChange?.(masked, unmasked);
    },
    autoApply: true
  });

  // Sincroniza valor externo com estado interno
  React.useEffect(() => {
    if (value !== undefined && value !== maskedValue) {
      setValue(value);
    }
  }, [value, maskedValue, setValue]);

  // Validação
  const isValid = React.useMemo(() => {
    if (!showValidation || !maskedValue) return true;
    if (validator) return validator(unmaskedValue);
    return true;
  }, [showValidation, maskedValue, unmaskedValue, validator]);

  // Classes CSS
  const inputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${showValidation && maskedValue && !isValid ? 'border-red-300' : ''}
    ${showValidation && maskedValue && isValid ? 'border-green-300' : ''}
    ${className}
  `.trim();

  const containerClasses = `
    space-y-1
    ${containerClassName}
  `.trim();

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          placeholder={placeholder}
          {...inputProps}
          {...props}
        />
        
        {showValidation && maskedValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isValid ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';

// Componentes específicos para facilitar o uso
export const CPFInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="cpf" placeholder="000.000.000-00" {...props} />
);
CPFInput.displayName = 'CPFInput';

export const CNPJInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="cnpj" placeholder="00.000.000/0000-00" {...props} />
);
CNPJInput.displayName = 'CNPJInput';

export const PhoneInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="phone" placeholder="(00) 00000-0000" {...props} />
);
PhoneInput.displayName = 'PhoneInput';

export const CEPInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="cep" placeholder="00000-000" {...props} />
);
CEPInput.displayName = 'CEPInput';

export const DateInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="date" placeholder="dd/mm/aaaa" {...props} />
);
DateInput.displayName = 'DateInput';

export const CurrencyInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="currency" placeholder="R$ 0,00" {...props} />
);
CurrencyInput.displayName = 'CurrencyInput';

export const DocumentInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>(
  (props, ref) => <MaskedInput ref={ref} mask="document" placeholder="CPF ou CNPJ" {...props} />
);
DocumentInput.displayName = 'DocumentInput';

export default MaskedInput;
