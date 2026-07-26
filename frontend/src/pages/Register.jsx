import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { register } from '../services/authService';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await register(formData);
            if (response.success) {
                toast.success('¡Cuenta creada con éxito!')
                navigate('/login');
            }
        } catch {
            toast.error('No se ha podido crear la cuenta, ¡intentalo nuevamente!')
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden animate-fade-in">
            {/* Orbes invertidos para diferenciar del Login */}
            <div className="absolute top-[-5%] right-[-5%] w-80 h-180 bg-brand rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-navy/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

            <div className="bg-white/60 backdrop-blur-glass border border-white/50 shadow-glass w-full max-w-md p-8 rounded-3xl relative z-10 animate-slide-up">

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 bg-background shadow-soft rounded-full flex items-center justify-center mb-4 text-brand">
                        <UserPlus size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-navy">Únete a FinanceSync</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    {/* Al tener el atributo name="", nuestro nuevo Input lo procesará correctamente */}
                    <Input
                        label="Nombre Completo"
                        name="name"
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="mt-4">
                        <Button type="submit" isLoading={isLoading}>
                            Crear Cuenta
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-textMuted font-medium">
                    ¿Ya tienes una cuenta?{' '}
                    <span className="text-brand font-bold cursor-pointer hover:text-brandDark" onClick={() => navigate('/login')}>
                        Inicia sesión
                    </span>
                </p>
            </div>
        </div>
    );
};