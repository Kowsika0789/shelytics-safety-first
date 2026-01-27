import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ChevronRight, Shield, MapPin, Bell, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import EmergencyContactsList from '@/components/contacts/EmergencyContactsList';
import SOSButton from '@/components/sos/SOSButton';
import FakeCallModal from '@/components/sos/FakeCallModal';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Shield className="w-12 h-12 text-primary animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <FakeCallModal />

      {/* Header */}
      <header className="relative animated-gradient pt-safe overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative z-10 px-4 pt-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-semibold text-primary-foreground">Profile</h1>
            <button className="p-2 rounded-lg bg-primary-foreground/10">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Profile Card */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">{profile?.name || 'User'}</h2>
              <p className="text-primary-foreground/80">{user?.email}</p>
              {profile?.phone && (
                <p className="text-primary-foreground/60 text-sm">{profile.phone}</p>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 -mt-8 relative z-10 space-y-6">
        {/* Stats */}
        <motion.div
          className="bg-card rounded-2xl p-4 border border-border shadow-strong"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-safe/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-safe" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {profile?.gps_enabled ? 'On' : 'Off'}
              </div>
              <div className="text-xs text-muted-foreground">GPS</div>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {profile?.notifications_enabled ? 'On' : 'Off'}
              </div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-risk/10 flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-risk" />
              </div>
              <div className="text-lg font-bold text-foreground">Active</div>
              <div className="text-xs text-muted-foreground">Tracking</div>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contacts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Emergency Contacts
            </h3>
          </div>
          <EmergencyContactsList />
        </section>

        {/* Settings */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-px bg-border" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Notification Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-px bg-border" />
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Location Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </main>

      {/* Floating SOS Button */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30">
        <SOSButton />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
