import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Shield,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Loader2,
  User,
  Users,
  Crown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import adminService from '@/services/admin.service';

const UserManagement = ({ userRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter }),
      };

      const response = await adminService.getAllUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      fetchUsers();
      setActiveMenu(null);
    } catch (err) {
      alert('Failed to update user role');
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'ban' : 'unban'} this user?`)) {
      return;
    }

    try {
      await adminService.toggleUserStatus(userId);
      fetchUsers();
      setActiveMenu(null);
    } catch (err) {
      alert('Failed to toggle user status');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone and will delete all their posts and comments.'
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      setActiveMenu(null);
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      moderator: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    };
    return colors[role] || colors.user;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Crown,
      moderator: Shield,
      user: User,
    };
    return icons[role] || User;
  };

  const getRoleConfig = (role) => {
    const config = {
      admin: {
        icon: Crown,
        color: 'text-red-600 dark:text-red-400',
        label: 'Admin'
      },
      moderator: {
        icon: Shield,
        color: 'text-yellow-600 dark:text-yellow-400',
        label: 'Moderator'
      },
      user: {
        icon: User,
        color: 'text-gray-600 dark:text-gray-400',
        label: 'User'
      }
    };
    return config[role] || config.user;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-card border-border/60">
        <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Banned</option>
          </select>
        </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400 text-sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Banned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>

                      {activeMenu === user._id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 border border-border/60">
                          <div className="py-2">
                            {/* Change Role Section */}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                              Change Role
                            </div>
                            {['user', 'moderator', 'admin'].map((role) => {
                              const roleConfig = getRoleConfig(role);
                              const RoleIcon = roleConfig.icon;
                              const isCurrentRole = user.role === role;

                              return (
                                <button
                                  key={role}
                                  onClick={() => handleUpdateRole(user._id, role)}
                                  disabled={isCurrentRole}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
                                    isCurrentRole
                                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700/50'
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg ${
                                    role === 'admin' ? 'bg-red-100 dark:bg-red-900/20' :
                                    role === 'moderator' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                    'bg-gray-100 dark:bg-gray-700'
                                  } flex items-center justify-center flex-shrink-0`}>
                                    <RoleIcon className={`h-4 w-4 ${roleConfig.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {roleConfig.label}
                                    </div>
                                    {isCurrentRole && (
                                      <div className="text-xs text-green-600 dark:text-green-400">
                                        Current role
                                      </div>
                                    )}
                                  </div>
                                  {isCurrentRole && (
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  )}
                                </button>
                              );
                            })}

                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

                            {/* Ban/Unban */}
                            <button
                              onClick={() => handleToggleStatus(user._id, user.isActive)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                <Ban className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="font-medium">
                                {user.isActive ? 'Ban User' : 'Unban User'}
                              </div>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="font-medium text-red-600 dark:text-red-400">
                                Delete User
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-muted/60 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-foreground">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
