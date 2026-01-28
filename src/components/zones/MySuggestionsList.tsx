import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useZoneSuggestions, ZoneSuggestion } from '@/hooks/useZoneSuggestions';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-safe" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-emergency" />;
    default:
      return <Clock className="w-4 h-4 text-risk" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending Review';
  }
};

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'safe':
      return <Shield className="w-4 h-4 text-safe" />;
    case 'emergency':
      return <AlertCircle className="w-4 h-4 text-emergency" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-risk" />;
  }
};

const MySuggestionsList: React.FC = () => {
  const { suggestions, loading, deleteSuggestion } = useZoneSuggestions();

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading your suggestions...
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">You haven't submitted any zone suggestions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion: ZoneSuggestion) => (
        <motion.div
          key={suggestion.id}
          className="p-4 rounded-xl bg-card border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getRiskIcon(suggestion.suggested_risk_level)}
                <h4 className="font-medium text-foreground truncate">{suggestion.name}</h4>
              </div>
              {suggestion.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {suggestion.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {getStatusIcon(suggestion.status)}
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(suggestion.status)}
                </span>
              </div>
              {suggestion.admin_notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Admin: {suggestion.admin_notes}
                </p>
              )}
            </div>

            {suggestion.status === 'pending' && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteSuggestion(suggestion.id)}
                className="text-muted-foreground hover:text-emergency"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MySuggestionsList;
