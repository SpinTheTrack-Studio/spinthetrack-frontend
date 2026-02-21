// src/types/game.ts

export type GameMode = 'EXPERT' | 'MAESTRO' | 'TWISTED' | 'FREDONNEUR';

export interface Player {
    name: string;
    score: number;
    avatar: string;
}

export interface Challenge {
    mode: 'EXPERT' | 'MAESTRO' | 'TWISTED' | 'HUMMER'; // Ajout de HUMMER
    track_id: string;
    track_title: string;
    track_artist: string;
    track_cover: string;
    question: string;
    answer: string;
    stream_url: string;
    lyrics_challenge: {
        start_time: number;
        stop_time: number;
        snippet: string;
        hidden_answer: string
    } | null;
    twist_factor?: number;
    playback_speed?: number;
}


export interface GameState {
    current_round: number;
    players: Player[];
    current_track_id: string | null;
    current_player_index: number;
    last_updated: number;
    current_challenge: Challenge | null;
    status: 'LOBBY' | 'PLAYLIST_SELECTION' | 'ROUND_INTRO' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED';
}


export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    gameId: string | null;
    gameState: GameState | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
    refreshGameState: () => Promise<void>;
}

export type ChallengeType = 'CHRONO' | 'BLIND' | 'LYRICS';

export interface ChallengeResponse {
    status: string;
    challenge: ChallengeType;
    challenge_info: {
        label: string;
        instruction: string;
        theme: string; // 'cyan' | 'purple' | 'pink'
        points_value: number;
    };
    track_info: {
        title: string;
        stream_url: string;
    };
}