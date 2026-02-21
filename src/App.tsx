import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider, useAuth} from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Round from './pages/Round';

const AppRoutes = () => {
    const {isAuthenticated, isLoading, gameState, gameId} = useAuth();
    if (isLoading) {
        return <div
            className="min-h-screen bg-black flex items-center justify-center text-white">Initialisation...</div>;
    }

    return (
        <Routes>
            {/* PRIORITÉ 1 : Pas de session => Login */}
            {!isAuthenticated ? (
                <>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </>
            ) : (
                <>
                    {/* SI CONNECTÉ */}
                    <Route path="/login" element={<Navigate to="/" replace/>}/>

                    {/* PRIORITÉ 2 & 3 : Jeu actif ou Dashboard */}
                    <Route path="/" element={
                        gameState?.current_round
                            ? <Navigate to={`/round/${gameId}`} replace/>
                            : <Dashboard/>
                    }/>

                    <Route path="/round/:id" element={
                        !gameState?.current_round
                            ? <Navigate to="/" replace/>
                            : <Round/>
                    }/>
                </>
            )}
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes/>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;