import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/magicui/fade-in';
import { GradientText } from '@/components/magicui/gradient-text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Hero from '@/components/layout/Hero';
import AdminStatistics from '@/components/admin/AdminStatistics';
import UserManagement from '@/components/admin/UserManagement';
import PostManagement from '@/components/admin/PostManagement';
import CommentManagement from '@/components/admin/CommentManagement';

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);

  // Check if user is admin or moderator
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      navigate('/');
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  const tabs = [
    {
      id: 'statistics',
      name: 'Statistics',
      icon: BarChart3,
      component: AdminStatistics,
      allowModerator: true,
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      component: UserManagement,
      allowModerator: false,
    },
    {
      id: 'posts',
      name: 'Posts',
      icon: FileText,
      component: PostManagement,
      allowModerator: true,
    },
    {
      id: 'comments',
      name: 'Comments',
      icon: MessageSquare,
      component: CommentManagement,
      allowModerator: true,
    },
  ];

  // Filter tabs based on user role
  const availableTabs = tabs.filter(
    (tab) => user?.role === 'admin' || tab.allowModerator
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const heroIcons = [
    { Icon: Shield, gradient: 'bg-gradient-to-r from-red-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <Hero
        title="Admin Panel"
        subtitle={`${user?.role === 'admin' ? 'Administrator' : 'Moderator'} Dashboard - Manage users, posts, comments and view platform statistics`}
        icons={heroIcons}
        showSingleIcon={true}
        align="left"
        size="medium"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <FadeIn>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/60 w-full h-auto flex flex-wrap justify-start gap-1 p-1 mb-6">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 text-sm flex-1 min-w-[120px]"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {availableTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <tab.component userRole={user?.role} />
              </TabsContent>
            ))}
          </Tabs>
        </FadeIn>
      </div>
    </div>
  );
};

export default AdminPanel;
