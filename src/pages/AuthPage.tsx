import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/shelytics-logo.png';

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (mode === 'signup') {
      if (!formData.name) {
        toast({
          title: 'Error',
          description: 'Please enter your name',
          variant: 'destructive'
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      if (formData.password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive'
            });
            setMode('login');
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to SHElytics. Let\'s set up your profile.'
          });
          navigate('/onboarding');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message.includes('Invalid') 
              ? 'Invalid email or password. Please try again.'
              : error.message,
            variant: 'destructive'
          });
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with gradient */}
      <div className="relative h-56 animated-gradient flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logo} alt="SHElytics" className="w-24 h-24 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-primary-foreground">SHElytics</h1>
          <p className="text-primary-foreground/80 text-sm">Women Safety Analytics</p>
        </motion.div>
      </div>

      {/* Auth Form */}
      <motion.div
        className="flex-1 px-6 pt-6 -mt-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-card rounded-3xl p-6 shadow-strong border border-border">
          {/* Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                mode === 'login' 
                  ? 'bg-card shadow-soft text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                mode === 'signup' 
                  ? 'bg-card shadow-soft text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 pl-12"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 pl-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-12 pl-12"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                'Please wait...'
              ) : mode === 'login' ? (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <span className="text-primary">Terms of Service</span>
          {' '}and{' '}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
