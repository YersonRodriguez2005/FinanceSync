import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { login as loginService, resetPasswordDirect } from '../services/authService'; // Renombramos el servicio para evitar colisiones
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';

export const Login = () => {
    const navigate = useNavigate();
    // Extraemos la acción real guardada en la bóveda de Zustand
    const setLogin = useAuthStore((state) => state.setLogin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await loginService(email, password);

            setLogin(data.user, data.token);

            toast.success(`¡Bienvenido de vuelta, ${data.user.name}!`);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Credenciales incorrectas.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        try {
            await resetPasswordDirect(resetEmail, newPassword);
            toast.success('¡Contraseña actualizada con éxito!');
            setTimeout(() => {
                setShowForgotModal(false);
                setResetEmail('');
                setNewPassword('');
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cambiar la contraseña.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden animate-fade-in">
            {/* Orbes de luz (Background) */}
            <div className="absolute top-10 left-10 w-72 h-180 bg-brand rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-navy/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            {/* Tarjeta Glassmorphism */}
            <div className="bg-white/60 backdrop-blur-glass border border-white/50 shadow-glass w-full max-w-md p-8 rounded-3xl relative z-10 animate-slide-up">

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-surface shadow-soft rounded-2xl flex items-center justify-center mb-4 text-brand border border-white/50">
                        <Wallet size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-navy tracking-tight">FinanceSync</h1>
                    <p className="text-sm text-textMuted mt-1">Tu dinero, sincronizado y seguro.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="mt-4">
                        <Button type="submit" isLoading={isLoading}>
                            Iniciar Sesión
                        </Button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="w-full mt-4 text-sm font-bold text-brand hover:text-brand-dark transition-colors cursor-pointer"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-textMuted font-medium">
                    ¿Nuevo en FinanceSync?{' '}
                    <span className="text-brand font-bold cursor-pointer hover:text-brand-dark transition-colors" onClick={() => navigate('/register')}>
                        Crea una cuenta
                    </span>
                </p>
            </div>

            {/* Modal para restablecer clave con consistencia de estilos */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-6 animate-fade-in">
                    <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-glass border border-white/40 animate-slide-up">
                        <h3 className="text-xl font-extrabold text-navy mb-2">Cambiar Contraseña</h3>
                        <p className="text-sm text-textMuted mb-4">Ingresa tu correo registrado y la nueva contraseña que deseas usar.</p>

                        <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                            <Input
                                type="email"
                                placeholder="tu@correo.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />

                            <Input
                                type="password"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="flex-1 py-3 bg-background text-textMuted rounded-xl font-bold active:scale-95 transition-transform cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-soft active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
                                >
                                    {isResetting ? 'Cambiando...' : 'Cambiar clave'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
