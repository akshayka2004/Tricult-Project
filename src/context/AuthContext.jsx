import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('tricult_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setIsAdmin(parsed.is_admin || false);
            setIsVolunteer(parsed.is_volunteer || false);
        }
        setLoading(false);
    }, []);

    const login = async (ticketNumber, password) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('ticket_number', ticketNumber)
            .eq('is_admin', false)
            .eq('is_volunteer', false)
            .single();

        if (error || !data) {
            throw new Error('Invalid ticket number');
        }

        const valid = bcrypt.compareSync(password, data.password);
        if (!valid) {
            throw new Error('Invalid password');
        }

        const userData = { ...data, password: undefined };
        setUser(userData);
        setIsAdmin(false);
        setIsVolunteer(false);
        localStorage.setItem('tricult_user', JSON.stringify(userData));
        return userData;
    };

    const adminLogin = async (username, password) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .eq('is_admin', true)
            .single();

        if (error || !data) {
            throw new Error('Invalid admin credentials');
        }

        const valid = bcrypt.compareSync(password, data.password);
        if (!valid) {
            throw new Error('Invalid password');
        }

        const userData = { ...data, password: undefined };
        setUser(userData);
        setIsAdmin(true);
        setIsVolunteer(false);
        localStorage.setItem('tricult_user', JSON.stringify({ ...userData, is_admin: true }));
        return userData;
    };

    const volunteerLogin = async (username, password) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .eq('is_volunteer', true)
            .single();

        if (error || !data) {
            throw new Error('Invalid volunteer credentials');
        }

        const valid = bcrypt.compareSync(password, data.password);
        if (!valid) {
            throw new Error('Invalid password');
        }

        const userData = { ...data, password: undefined };
        setUser(userData);
        setIsAdmin(false);
        setIsVolunteer(true);
        localStorage.setItem('tricult_user', JSON.stringify({ ...userData, is_volunteer: true }));
        return userData;
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        setIsVolunteer(false);
        localStorage.removeItem('tricult_user');
    };

    const refreshUser = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) {
            const userData = { ...data, password: undefined };
            setUser(userData);
            localStorage.setItem('tricult_user', JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, isVolunteer, loading, login, adminLogin, volunteerLogin, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
