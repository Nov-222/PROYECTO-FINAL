import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../shared/api/apiClient';
import './RegisterForm.css';

// Esquema de validación (Refleja las reglas del backend)
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  birth_date: z.string().refine((dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, 'Debes ser mayor de 18 años para registrarte'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      setSuccessMessage(null);
      
      // Simulamos un fingerprint del dispositivo básico
      const payload = {
        ...data,
        device_fingerprint: navigator.userAgent,
      };

      await apiClient.post('/auth/register', payload);
      setSuccessMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setServerError('Este correo ya está registrado.');
      } else {
        setServerError('Ocurrió un error en el servidor. Intenta más tarde.');
      }
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="auth-form__title">Crear Cuenta</h2>
      
      {serverError && <div className="auth-form__alert auth-form__alert--error">{serverError}</div>}
      {successMessage && <div className="auth-form__alert auth-form__alert--success">{successMessage}</div>}

      <div className="auth-form__field">
        <label className="auth-form__label">Nombre completo</label>
        <input className="auth-form__input" type="text" {...register('name')} />
        {errors.name && <span className="auth-form__error">{errors.name.message}</span>}
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Correo electrónico</label>
        <input className="auth-form__input" type="email" {...register('email')} />
        {errors.email && <span className="auth-form__error">{errors.email.message}</span>}
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Contraseña</label>
        <input className="auth-form__input" type="password" {...register('password')} />
        {errors.password && <span className="auth-form__error">{errors.password.message}</span>}
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label">Fecha de nacimiento</label>
        <input className="auth-form__input" type="date" {...register('birth_date')} />
        {errors.birth_date && <span className="auth-form__error">{errors.birth_date.message}</span>}
      </div>

      <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
};