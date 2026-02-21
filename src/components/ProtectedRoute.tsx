import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const ProtectedRoute = () => {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;
    }

    // Si pas connecté -> Hop, dehors, direction Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    // Sinon, on affiche le contenu protégé (Le Jeu)
    return <Outlet/>;
};

export default ProtectedRoute;