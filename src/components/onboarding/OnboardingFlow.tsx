import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, User, Phone, MapPin, Bell, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/shelytics-logo.png';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome to SHElytics', description: 'Your personal safety companion', icon: Shield },
  { id: 'profile', title: 'Your Profile', description: 'Tell us about yourself', icon: User },
  { id: 'contacts', title: 'Emergency Contacts', description: 'Add people who can help', icon: Users },
  { id: 'location', title: 'Location Access', description: 'Stay safe with real-time tracking', icon: MapPin },
  { id: 'notifications', title: 'Notifications', description: 'Get instant safety alerts', icon: Bell },
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { requestPermission } = useLocation();
  const { addContact } = useEmergencyContacts();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age?.toString() || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });
  const [contacts, setContacts] = useState([
    { name: '', phone: '', relationship: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    const step = steps[currentStep];

    if (step.id === 'profile') {
      if (!formData.name.trim()) {
        toast({ title: 'Error', description: 'Please enter your name', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      await updateProfile({
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      });
      setIsLoading(false);
    }

    if (step.id === 'contacts') {
      setIsLoading(true);
      for (const contact of contacts) {
        if (contact.name.trim() && contact.phone.trim()) {
          await addContact({
            name: contact.name.trim(),
            phone: contact.phone.trim(),
            relationship: contact.relationship.trim() || undefined,
            is_primary: contacts.indexOf(contact) === 0
          });
        }
      }
      setIsLoading(false);
    }

    if (step.id === 'location') {
      const granted = await requestPermission();
      await updateProfile({ gps_enabled: granted });
    }

    if (step.id === 'notifications') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        await updateProfile({ notifications_enabled: permission === 'granted' });
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await updateProfile({ onboarding_completed: true });
      navigate('/home');
    }
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '', relationship: '' }]);
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center">
            <motion.img
              src={logo}
              alt="SHElytics"
              className="w-32 h-32 mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            />
            <h1 className="text-3xl font-bold text-foreground mb-3">SHElytics</h1>
            <p className="text-muted-foreground mb-8">
              Women Safety Analytics - Your personal safety companion that keeps you protected 24/7
            </p>
            <div className="space-y-4 text-left bg-accent/30 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-safe" />
                <span className="text-foreground">Real-time location tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-safe" />
                <span className="text-foreground">AI-powered risk zone detection</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-safe" />
                <span className="text-foreground">One-tap SOS alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-safe" />
                <span className="text-foreground">Emergency contact notifications</span>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Tell us about yourself</h2>
              <p className="text-muted-foreground text-sm">This helps us personalize your safety experience</p>
            </div>
            <Input
              placeholder="Your Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
            <Input
              placeholder="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="h-12"
            />
            <Input
              placeholder="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12"
            />
            <Input
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="h-12"
            />
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Emergency Contacts</h2>
              <p className="text-muted-foreground text-sm">These people will be notified in emergencies</p>
            </div>
            {contacts.map((contact, index) => (
              <div key={index} className="space-y-3 p-4 bg-accent/30 rounded-xl">
                <p className="text-sm font-medium text-foreground">Contact {index + 1}</p>
                <Input
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                />
                <Input
                  placeholder="Relationship (e.g., Mom, Friend)"
                  value={contact.relationship}
                  onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                />
              </div>
            ))}
            <Button variant="outline" onClick={handleAddContact} className="w-full">
              + Add Another Contact
            </Button>
          </div>
        );

      case 'location':
        return (
          <div className="text-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MapPin className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Location Access</h2>
            <p className="text-muted-foreground mb-8">
              We need access to your location to detect risk zones and send accurate emergency alerts
            </p>
            <div className="bg-accent/30 rounded-2xl p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Real-time protection</p>
                  <p className="text-sm text-muted-foreground">Get alerts when entering risk zones</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Accurate SOS</p>
                  <p className="text-sm text-muted-foreground">Send precise location to emergency contacts</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="text-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Bell className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Stay Informed</h2>
            <p className="text-muted-foreground mb-8">
              Receive instant alerts about safety risks and emergency updates
            </p>
            <div className="bg-accent/30 rounded-2xl p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-risk mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Risk Zone Alerts</p>
                  <p className="text-sm text-muted-foreground">Know when you're entering a high-risk area</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-safe mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Safety Updates</p>
                  <p className="text-sm text-muted-foreground">Get important safety information</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Indicator */}
      <div className="p-4 pt-safe">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-6 pb-safe border-t border-border bg-card">
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            'Saving...'
          ) : currentStep === steps.length - 1 ? (
            'Get Started'
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
