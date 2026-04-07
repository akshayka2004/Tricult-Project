import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

    const fetchOrCreateUser = async (role) => {
        const mockProfile = {
            id: role === 'admin' ? 'admin-uuid' : role === 'volunteer' ? 'vol-uuid' : 'user-uuid',
            username: role === 'admin' ? 'AdminDemo' : role === 'volunteer' ? 'VolDemo' : 'UserDemo',
            ticket_number: role === 'admin' ? 'ADM-000' : role === 'volunteer' ? 'VOL-000' : 'USR-000',
            is_admin: role === 'admin',
            is_volunteer: role === 'volunteer',
            balance_tokens: role === 'user' ? 1000 : 0
        };

        try {
            let q = supabase.from('profiles').select('*');
            if (role === 'admin') q = q.eq('is_admin', true);
            else if (role === 'volunteer') q = q.eq('is_volunteer', true);
            else q = q.eq('is_admin', false).eq('is_volunteer', false);
            
            const { data, error } = await q.limit(1).single();
            
            if (error || !data) {
                // Try to insert if possible, but don't crash if it fails
                try {
                    const { data: newData } = await supabase.from('profiles').insert({
                        ...mockProfile,
                        password: 'noop'
                    }).select().single();
                    if (newData) return finalizeUser(newData);
                } catch (err) {
                    console.warn("Supabase insert failed, using local mock:", err);
                }
                return finalizeUser(mockProfile);
            }

            return finalizeUser(data);
        } catch (err) {
            console.error("Supabase communication error, using local mock:", err);
            return finalizeUser(mockProfile);
        }
    };

    const finalizeUser = (data) => {
        const userData = { ...data, password: undefined };
        setUser(userData);
        setIsAdmin(!!userData.is_admin);
        setIsVolunteer(!!userData.is_volunteer);
        localStorage.setItem('tricult_user', JSON.stringify(userData));
        return userData;
    };

    const login = async () => fetchOrCreateUser('user');
    const adminLogin = async () => fetchOrCreateUser('admin');
    const volunteerLogin = async () => fetchOrCreateUser('volunteer');

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
