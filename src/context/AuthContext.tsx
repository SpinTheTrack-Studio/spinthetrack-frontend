import {createContext, useContext, useState, useEffect, type ReactNode} from 'react';
import {v4 as uuidv4} from 'uuid';
import type {AuthContextType, GameState} from "../types/game.ts";

const AUTH_KEY = 'spinthetrack_is_logged_in';
const GAME_ID_KEY = 'spinthetrack_game_id';
const BACKEND_URL = 'http://localhost:8000';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameId, setGameId] = useState<string | null>(localStorage.getItem(GAME_ID_KEY));

    const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
        const headers = new Headers(options.headers);

        // Injection du Game ID
        if (gameId) {
            headers.set('X-Game-ID', gameId);
        }

        headers.set('Content-Type', 'application/json');

        return fetch(`${BACKEND_URL}${endpoint}`, {
            ...options,
            headers,
        });
    };
    const refreshGameState = async () => {
        try {
            const response = await apiFetch('/api/game/state');
            if (response.ok) {
                const data = await response.json();
                setGameState(data);
            }
        } catch (error) {
            console.error("Erreur State:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const isLogged = localStorage.getItem(AUTH_KEY) === 'true';
            setIsAuthenticated(isLogged);
            if (isLogged) await refreshGameState();
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        });

        if (!response.ok) throw new Error('Invalide');

        localStorage.setItem(AUTH_KEY, 'true');
        let currentId = localStorage.getItem(GAME_ID_KEY);
        if (!currentId) {
            currentId = uuidv4();
            localStorage.setItem(GAME_ID_KEY, currentId);
        }
        setGameId(currentId);
        setIsAuthenticated(true);
        await refreshGameState();
    };

    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(GAME_ID_KEY);
        setGameId(null);
        setGameState(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated, isLoading, gameId, gameState,
            login, logout, apiFetch, refreshGameState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};