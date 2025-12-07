import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Activity, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import adminService from '@/services/admin.service';

const AdminStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStatistics();
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: statistics.users.total,
      icon: Users,
      color: 'blue',
      subStats: [
        { label: 'Active', value: statistics.users.active },
        { label: 'Inactive', value: statistics.users.inactive },
      ],
    },
    {
      title: 'Total Posts',
      value: statistics.content.totalPosts,
      icon: FileText,
      color: 'green',
      subStats: [
        { label: 'Last 7 days', value: statistics.recentActivity.newPosts },
      ],
    },
    {
      title: 'Total Comments',
      value: statistics.content.totalComments,
      icon: MessageSquare,
      color: 'purple',
      subStats: [
        { label: 'Last 7 days', value: statistics.recentActivity.newComments },
      ],
    },
    {
      title: 'New Users (7d)',
      value: statistics.recentActivity.newUsers,
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  const roleCards = [
    {
      title: 'Admins',
      value: statistics.users.byRole.admin,
      icon: Shield,
      color: 'red',
    },
    {
      title: 'Moderators',
      value: statistics.users.byRole.moderator,
      icon: Shield,
      color: 'yellow',
    },
    {
      title: 'Regular Users',
      value: statistics.users.byRole.user,
      icon: Users,
      color: 'gray',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-card border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {stat.value.toLocaleString()}
                      </p>
                      {stat.subStats && (
                        <div className="mt-2 space-y-1">
                          {stat.subStats.map((subStat) => (
                            <p
                              key={subStat.label}
                              className="text-xs text-muted-foreground"
                            >
                              {subStat.label}: {subStat.value.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* User Roles */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Users by Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleCards.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.title} className="bg-card border-border/60">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {role.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {role.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[role.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border/60">
        <CardHeader>
          <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.recentActivity.newUsers}
              </p>
              <p className="text-sm text-muted-foreground mt-1">New Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.recentActivity.newPosts}
              </p>
              <p className="text-sm text-muted-foreground mt-1">New Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.recentActivity.newComments}
              </p>
              <p className="text-sm text-muted-foreground mt-1">New Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatistics;
