import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const parseUser = (token) => {
    try {
        const decoded = jwtDecode(token);
        const rawRole = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || '').toString().trim();
        const rolId = decoded.RolId ? parseInt(decoded.RolId, 10) : null;
        
        let role = rawRole;
        if (rawRole.toLowerCase() === 'admin' || rolId === 1) {
            role = 'Admin';
        } else if (rawRole.toLowerCase() === 'maestro' || rolId === 2) {
            role = 'Maestro';
        } else if (rawRole.toLowerCase() === 'estudiante' || rolId === 3) {
            role = 'Estudiante';
        }

        return {
            id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
            role,
            rawRole,
            rolId
        };
    } catch (error) {
        console.error("Error decoding token", error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const parsedUser = parseUser(token);
            if (parsedUser) {
                setUser(parsedUser);
            } else {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const parsedUser = parseUser(token);
        setUser(parsedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

