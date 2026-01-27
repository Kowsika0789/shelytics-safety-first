import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Phone, Users, MapPin, Moon, Clock, Bell } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SOSButton from '@/components/sos/SOSButton';
import FakeCallModal from '@/components/sos/FakeCallModal';
import { useAuth } from '@/contexts/AuthContext';

const safetyTips = [
  {
    icon: MapPin,
    title: 'Stay in Well-Lit Areas',
    description: 'Avoid dark alleys and poorly lit streets, especially at night.',
    color: 'text-safe'
  },
  {
    icon: Users,
    title: 'Share Your Location',
    description: 'Keep trusted contacts informed about your whereabouts.',
    color: 'text-primary'
  },
  {
    icon: Phone,
    title: 'Keep Phone Charged',
    description: 'Ensure your phone has enough battery for emergencies.',
    color: 'text-risk'
  },
  {
    icon: Moon,
    title: 'Avoid Late Hours',
    description: 'Risk increases significantly after 10 PM in many areas.',
    color: 'text-muted-foreground'
  },
  {
    icon: Bell,
    title: 'Trust Your Instincts',
    description: 'If something feels wrong, leave the area immediately.',
    color: 'text-emergency'
  },
  {
    icon: Clock,
    title: 'Plan Your Route',
    description: 'Know your path beforehand and stick to busy routes.',
    color: 'text-primary'
  },
];

const emergencyNumbers = [
  { name: 'Police', number: '100', description: 'For immediate help' },
  { name: 'Women Helpline', number: '1091', description: '24/7 support' },
  { name: 'Emergency', number: '112', description: 'Universal emergency' },
  { name: 'Ambulance', number: '102', description: 'Medical emergencies' },
];

const SafetyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 pt-safe">
        <div>
          <h1 className="font-semibold text-foreground">Safety Center</h1>
          <p className="text-xs text-muted-foreground">Tips & emergency contacts</p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Emergency Numbers */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emergency" />
            Emergency Numbers
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {emergencyNumbers.map((item, index) => (
              <motion.a
                key={item.number}
                href={`tel:${item.number}`}
                className="bg-card rounded-xl p-4 border border-border shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl font-bold text-primary">{item.number}</div>
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Safety Tips */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-safe" />
            Safety Tips
          </h2>
          <div className="space-y-3">
            {safetyTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  className="bg-card rounded-xl p-4 border border-border shadow-soft"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent">
                      <Icon className={`w-5 h-5 ${tip.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Safety Stats */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-risk" />
            Risk Awareness
          </h2>
          <motion.div
            className="bg-gradient-to-br from-primary/10 to-accent rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-safe">85%</div>
                <div className="text-xs text-muted-foreground">Safe Areas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-risk">12%</div>
                <div className="text-xs text-muted-foreground">Moderate Risk</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emergency">3%</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Risk zones are updated based on historical data and real-time incidents.
            </p>
          </motion.div>
        </section>
      </main>

      {/* Floating SOS Button */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30">
        <SOSButton />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SafetyPage;
