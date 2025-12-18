import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Ban, CheckCircle, Search, RefreshCw, Shield, UserCheck, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Professional Role Management Page
 * Super Admin has full control - matches admin panel design
 */
const SimpleUserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const SUPER_ADMIN_EMAIL = 'badshahkha656@gmail.com';

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch('http://localhost:5000/api/admin/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('Auth verification failed');
                return;
            }

            const data = await response.json();
            console.log('Current user:', data.user);
            setCurrentUserEmail(data.user?.email || '');
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Try both token names (admin panel uses 'token')
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

            if (!token) {
                console.error('No auth token found. Please login first.');
                setLoading(false);
                return;
            }

            console.log('Fetching users...');
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Users fetched:', data);

            if (!data.users || !Array.isArray(data.users)) {
                console.error('Invalid response format:', data);
                setUsers([]);
                return;
            }

            const filteredUsers = data.users.filter(u => u.email !== SUPER_ADMIN_EMAIL);
            console.log(`Total users: ${data.users.length}, Filtered: ${filteredUsers.length}`);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        await fetchUsers();
        setIsRefreshing(false);
    };

    const handleViewUser = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleBlockUser = async (userId, isActive) => {
        const action = isActive ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this user?${!isActive ? '' : '\n\nBlocked users cannot login or access the platform.'}`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ isActive: !isActive })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Block user error:', errorData);
                alert(`Error: ${errorData.message || 'Failed to update user'}`);
                return;
            }

            fetchUsers();
        } catch (error) {
            console.error('Failed to block/unblock user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('⚠️ WARNING: This action is permanent!\n\nAre you sure you want to delete this user?\n\nAll their data will be permanently removed.')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete user'}`);
                return;
            }

            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleToggleAdmin = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promote to Admin' : 'remove Admin privileges from';

        if (!window.confirm(`Are you sure you want to ${action} this user?\n\nThis will change their access level.`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to update role'}`);
                return;
            }

            fetchUsers();
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSuperAdmin = currentUserEmail === SUPER_ADMIN_EMAIL;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading user management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">User Management</h1>
                            <p className="text-gray-400">
                                Manage user accounts, view details, and control access
                                {isSuperAdmin && <span className="ml-2 text-green-400">• Super Admin Mode</span>}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-cyan-400 transition-colors text-gray-300 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Total Users</p>
                            <UserCheck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{users.length}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-green-500/20 hover:border-green-500/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Active Users</p>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                            {users.filter(u => u.isActive !== false).length}
                        </p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-red-500/20 hover:border-red-500/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">Blocked Users</p>
                            <Ban className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-red-400">
                            {users.filter(u => u.isActive === false).length}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-700/50 border-b border-gray-700">
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">User</th>
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Email</th>
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Role</th>
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Points</th>
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full border-2 border-cyan-500/50"
                                                />
                                                <p className="font-semibold text-white">{user.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-300">{user.email}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                : user.role === 'developer'
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-semibold text-green-400">{user.points || 0}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${user.isActive !== false
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                }`}>
                                                {user.isActive !== false ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {/* View Button - Everyone Can See */}
                                                <button
                                                    onClick={() => handleViewUser(user._id)}
                                                    className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {/* Make/Remove Admin Button - Super Admin Only */}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleToggleAdmin(user._id, user.role)}
                                                        className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                                                            ? 'text-orange-400 hover:bg-orange-500/20'
                                                            : 'text-yellow-400 hover:bg-yellow-500/20'
                                                            }`}
                                                        title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                    >
                                                        <Crown size={18} />
                                                    </button>
                                                )}

                                                {/* Block/Unblock Button - Super Admin Only */}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleBlockUser(user._id, user.isActive !== false)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isActive !== false
                                                            ? 'text-red-400 hover:bg-red-500/20'
                                                            : 'text-green-400 hover:bg-green-500/20'
                                                            }`}
                                                        title={user.isActive !== false ? 'Block User' : 'Unblock User'}
                                                    >
                                                        {user.isActive !== false ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                    </button>
                                                )}

                                                {/* Delete Button - Super Admin Only */}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400">No users found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleUserManagement;
