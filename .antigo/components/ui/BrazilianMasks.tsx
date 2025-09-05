import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useMask, MaskType } from '@/hooks/useMask';
import { validators } from '@/lib/masks';

// Tipo base para props dos inputs
interface BaseMaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string, unmaskedValue: string) => void;
  error?: boolean;
  helperText?: string;
  showValidation?: boolean;
}

// Props específicas para input com máscara personalizada
interface MaskedInputProps extends BaseMaskedInputProps {
  mask: MaskType;
  validateOnBlur?: boolean;
}

/**
 * Input com máscara personalizada
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, error, helperText, showValidation = false, validateOnBlur = false, className = '', ...props }, ref) => {
    const maskHook = useMask({
      mask,
      initialValue: value,
      onChange
    });

    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    const handleValidation = () => {
      if (!showValidation) return;

      const validator = validators[mask as keyof typeof validators];
      if (validator) {
        setIsValid(validator(maskHook.value));
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      maskHook.handleBlur(e);
      if (validateOnBlur) {
        handleValidation();
      }
      props.onBlur?.(e);
    };

    const getValidationColor = () => {
      if (!showValidation || isValid === null) return '';
      return isValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500';
    };

    const baseClasses = `
      mt-1 block w-full px-3 py-2 border rounded-md shadow-sm 
      focus:ring-1 focus:ring-offset-0 transition-colors
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${error || (showValidation && isValid === false) 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : showValidation && isValid === true
        ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
      }
      ${className}
    `;

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          value={maskHook.value}
          onChange={maskHook.handleChange}
          onBlur={handleBlur}
          className={baseClasses.trim()}
        />
        {(helperText || (showValidation && isValid !== null)) && (
          <div className="mt-1 text-sm">
            {helperText && (
              <p className={error ? 'text-red-600' : 'text-gray-500'}>
                {helperText}
              </p>
            )}
            {showValidation && isValid !== null && (
              <p className={isValid ? 'text-green-600' : 'text-red-600'}>
                {isValid ? '✓ Válido' : '✗ Formato inválido'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

/**
 * Input específico para CPF
 */
export const CPFInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="cpf"
      placeholder="000.000.000-00"
      maxLength={14}
      showValidation
      validateOnBlur
    />
  )
);

CPFInput.displayName = 'CPFInput';

/**
 * Input específico para CNPJ
 */
export const CNPJInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="cnpj"
      placeholder="00.000.000/0000-00"
      maxLength={18}
      showValidation
      validateOnBlur
    />
  )
);

CNPJInput.displayName = 'CNPJInput';

/**
 * Input automático para CPF ou CNPJ
 */
export const DocumentInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="document"
      placeholder="CPF ou CNPJ"
      maxLength={18}
      showValidation
      validateOnBlur
    />
  )
);

DocumentInput.displayName = 'DocumentInput';

/**
 * Input específico para telefone
 */
export const PhoneInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="phone"
      placeholder="(00) 00000-0000"
      maxLength={15}
      showValidation
      validateOnBlur
    />
  )
);

PhoneInput.displayName = 'PhoneInput';

/**
 * Input específico para CEP
 */
export const CEPInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="cep"
      placeholder="00000-000"
      maxLength={9}
      showValidation
      validateOnBlur
    />
  )
);

CEPInput.displayName = 'CEPInput';

/**
 * Input específico para data
 */
export const DateInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="date"
      placeholder="00/00/0000"
      maxLength={10}
    />
  )
);

DateInput.displayName = 'DateInput';

/**
 * Input específico para horário
 */
export const TimeInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="time"
      placeholder="00:00"
      maxLength={5}
    />
  )
);

TimeInput.displayName = 'TimeInput';

/**
 * Input específico para moeda
 */
export const CurrencyInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="currency"
      placeholder="R$ 0,00"
    />
  )
);

CurrencyInput.displayName = 'CurrencyInput';

/**
 * Input específico para porcentagem
 */
export const PercentageInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="percentage"
      placeholder="0,00%"
    />
  )
);

PercentageInput.displayName = 'PercentageInput';

/**
 * Input específico para RG
 */
export const RGInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="rg"
      placeholder="00.000.000-0"
      maxLength={12}
    />
  )
);

RGInput.displayName = 'RGInput';

/**
 * Input específico para cartão de crédito
 */
export const CreditCardInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="creditCard"
      placeholder="0000 0000 0000 0000"
      maxLength={19}
    />
  )
);

CreditCardInput.displayName = 'CreditCardInput';

/**
 * Input específico para placa de veículo
 */
export const PlacaInput = forwardRef<HTMLInputElement, Omit<BaseMaskedInputProps, 'mask'>>(
  (props, ref) => (
    <MaskedInput
      {...props}
      ref={ref}
      mask="placa"
      placeholder="ABC-0000"
      maxLength={8}
      style={{ textTransform: 'uppercase' }}
    />
  )
);

PlacaInput.displayName = 'PlacaInput';

/**
 * Hook personalizado para usar múltiplas máscaras
 */
export const useBrazilianMasks = () => {
  return {
    cpf: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'cpf', initialValue: value, onChange }),
    cnpj: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'cnpj', initialValue: value, onChange }),
    phone: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'phone', initialValue: value, onChange }),
    cep: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'cep', initialValue: value, onChange }),
    date: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'date', initialValue: value, onChange }),
    currency: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'currency', initialValue: value, onChange }),
    percentage: (value?: string, onChange?: (value: string, unmasked: string) => void) => 
      useMask({ mask: 'percentage', initialValue: value, onChange })
  };
};

// Exportação padrão com todos os componentes
export default {
  MaskedInput,
  CPFInput,
  CNPJInput,
  DocumentInput,
  PhoneInput,
  CEPInput,
  DateInput,
  TimeInput,
  CurrencyInput,
  PercentageInput,
  RGInput,
  CreditCardInput,
  PlacaInput,
  useBrazilianMasks
};
