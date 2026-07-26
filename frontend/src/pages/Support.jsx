import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircleQuestion } from 'lucide-react';

// 🟢 Aquí es donde un Senior guarda las FAQs estáticas
const FAQS = [
    {
        id: 1,
        question: "¿Cómo edito o elimino una transacción?",
        answer: "Ve a la pestaña de Historial, busca el registro que deseas eliminar y presiona el ícono de la papelera roja. Por ahora no es posible editar, deberás eliminarlo y registrarlo nuevamente."
    },
    {
        id: 2,
        question: "¿Puedo cambiar la meta de un ahorro en progreso?",
        answer: "Actualmente las metas son fijas una vez creadas. Si necesitas cambiar el valor objetivo, te recomendamos eliminar la meta y crear una nueva con el monto correcto."
    },
    {
        id: 3,
        question: "¿Cómo funciona el cálculo en Préstamos?",
        answer: "El sistema separa automáticamente el dinero que te deben (Ingresos futuros) del dinero que tú debes (Gastos futuros). El porcentaje avanza cada vez que registras un abono usando el botón de suma."
    },
    {
        id: 4,
        question: "¿Mis datos están seguros?",
        answer: "Sí, FinanceSync utiliza encriptación de contraseñas y tokens JWT de seguridad para garantizar que solo tú puedas ver tu información financiera."
    }
];

export const Support = () => {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null); // Controla qué FAQ está abierta

    const toggleFaq = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-background p-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-180 bg-linear-to-b from-brand to-transparent z-0 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-surface shadow-soft rounded-full flex items-center justify-center text-navy active:shadow-soft-inset transition-shadow">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-extrabold text-navy">Ayuda y Soporte</h1>
                </div>

                <div className="bg-brand/10 p-5 rounded-3xl mb-8 flex items-center gap-4 border border-brand/20">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand shadow-sm">
                        <MessageCircleQuestion size={24} />
                    </div>
                    <div>
                        <h2 className="text-navy font-extrabold text-lg">Preguntas Frecuentes</h2>
                        <p className="text-textMuted text-xs">Resuelve tus dudas rápidamente</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {FAQS.map((faq) => (
                        <div key={faq.id} className="bg-surface border border-white/50 shadow-soft rounded-2xl overflow-hidden transition-all">
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left active:bg-background/50 transition-colors"
                            >
                                <span className="font-bold text-navy pr-4">{faq.question}</span>
                                {openId === faq.id ? <ChevronUp size={20} className="text-brand shrink-0" /> : <ChevronDown size={20} className="text-textMuted shrink-0" />}
                            </button>

                            {/* Panel desplegable con animación */}
                            <div className={`transition-all duration-300 ease-in-out ${openId === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 pt-0 text-sm text-textMuted leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};