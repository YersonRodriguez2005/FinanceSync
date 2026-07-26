import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './context/useAuthStore';
import { Toaster } from 'react-hot-toast';

// Importación de Páginas
import { Login } from './pages/Login';
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History'
import { Reports } from './pages/Reports'
import { Savings } from './pages/Savings'
import { Loans } from './pages/Loans'
import { Profile } from './pages/Profile';
import { PersonalData } from './pages/PersonalData';
import { Support } from './pages/Support';


// Inicializamos el cliente de caché para React Query
const queryClient = new QueryClient();

// Componente "Guardia de Seguridad" del Frontend
const PrivateRoute = ({ children }) => {
    // Leemos la bóveda de Zustand para saber si tiene token
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Si está autenticado, renderiza el componente (children), si no, lo patea al login
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    maxToasts={3}
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#F8FAFC', // Color surface
                            color: '#1E293B', // Color navy
                            fontWeight: 'bold',
                            borderRadius: '16px',
                            padding: '16px',
                            boxShadow: '8px 8px 16px #e2e8f0, -8px -8px 16px #ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                        },
                        success: {
                            iconTheme: { primary: '#00D09C', secondary: '#ffffff' },
                        },
                        error: {
                            iconTheme: { primary: '#FF4747', secondary: '#ffffff' },
                        },
                    }}
                />

                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* Rutas Privadas */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <History />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute >
                                <Reports />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/savings"
                        element={
                            <PrivateRoute >
                                <Savings />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/loans"
                        element={
                            <PrivateRoute >
                                <Loans />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute >
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile/personal-data"
                        element={
                            <PrivateRoute >
                                <PersonalData />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile/support"
                        element={
                            <PrivateRoute >
                                <Support />
                            </PrivateRoute>
                        }
                    />

                    {/* Redirección comodín: Si la ruta no existe, mándalo al dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
};

export default App;