import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/useAuthStore';
import { updateProfile } from '../services/authService';
import { Button } from '../components/Button';

export const PersonalData = () => {
    const navigate = useNavigate();

    // Obtenemos el usuario y la acción de Zustand para guardar la sesión modificada
    const user = useAuthStore((state) => state.user);
    const setLogin = useAuthStore((state) => state.setLogin);
    const token = useAuthStore((state) => state.token);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const updatePromise = updateProfile({ name, email });

        toast.promise(updatePromise, {
            loading: 'Guardando cambios en FinanceSync...',
            success: '¡Datos actualizados con éxito!',
            error: 'Error al actualizar tus datos.',
        });

        try {
            const response = await updatePromise;

            // Pasamos los nuevos datos del perfil y mantenemos el token JWT actual
            const updatedUser = response.user || response.data || { ...user, name, email };
            setLogin(updatedUser, token);

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 animate-fade-in relative overflow-hidden">
            {/* Halo sutil de fondo para resaltar Soft UI */}
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header Premium */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-extrabold text-navy">Datos Personales</h1>
                </div>

                {/* Contenedor Esmerilado */}
                <div className="bg-surface/80 backdrop-blur-glass border border-white/50 shadow-glass rounded-3xl p-6">
                    <div className="w-20 h-20 bg-brand text-white text-3xl font-extrabold rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft border-2 border-white">
                        {name.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Input Nombre */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Tu nombre completo"
                                className="w-full pl-12 pr-4 py-3 bg-background text-navy font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand/40 shadow-soft-inset transition-all"
                            />
                        </div>

                        {/* Input Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@correo.com"
                                className="w-full pl-12 pr-4 py-3 bg-background text-navy font-bold rounded-xl outline-none focus:ring-2 focus:ring-brand/40 shadow-soft-inset transition-all"
                            />
                        </div>

                        {/* Botón de envío con estado de carga integrado */}
                        <div className="mt-4">
                            <Button type="submit" isLoading={isLoading}>
                                <div className="flex items-center justify-center gap-2">
                                    <Save size={20} /> Guardar Cambios
                                </div>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
