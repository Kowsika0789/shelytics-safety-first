import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Trash2, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from '@/hooks/use-toast';

interface EmergencyContactsListProps {
  editable?: boolean;
}

const EmergencyContactsList: React.FC<EmergencyContactsListProps> = ({ editable = true }) => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useEmergencyContacts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast({
        title: 'Error',
        description: 'Name and phone number are required.',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await addContact({
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship.trim() || undefined,
      is_primary: contacts.length === 0
    });

    if (!error) {
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
      toast({
        title: 'Contact Added',
        description: `${newContact.name} has been added to your emergency contacts.`
      });
    }
  };

  const handleSetPrimary = async (id: string) => {
    // First, unset all as primary
    for (const contact of contacts) {
      if (contact.is_primary) {
        await updateContact(contact.id, { is_primary: false });
      }
    }
    // Set the selected one as primary
    await updateContact(id, { is_primary: true });
    toast({
      title: 'Primary Contact Updated',
      description: 'This contact will be notified first in emergencies.'
    });
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteContact(id);
    toast({
      title: 'Contact Removed',
      description: `${name} has been removed from your emergency contacts.`
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contacts List */}
      {contacts.map((contact, index) => (
        <motion.div
          key={contact.id}
          className="bg-card rounded-xl p-4 border border-border shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground truncate">{contact.name}</h4>
                {contact.is_primary && (
                  <Star className="w-4 h-4 text-risk fill-risk" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
              {contact.relationship && (
                <p className="text-xs text-muted-foreground">{contact.relationship}</p>
              )}
            </div>
            {editable && (
              <div className="flex items-center gap-2">
                {!contact.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="p-2 rounded-lg hover:bg-muted"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 rounded-lg bg-safe/10 hover:bg-safe/20"
                >
                  <Phone className="w-4 h-4 text-safe" />
                </a>
                <button
                  onClick={() => handleDelete(contact.id, contact.name)}
                  className="p-2 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Add Contact Form */}
      {showAddForm ? (
        <motion.div
          className="bg-card rounded-xl p-4 border border-border shadow-soft space-y-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Input
            placeholder="Contact Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          />
          <Input
            placeholder="Relationship (optional)"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddContact} className="flex-1">
              Add Contact
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      ) : (
        editable && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Emergency Contact
          </Button>
        )
      )}

      {contacts.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No emergency contacts added yet</p>
          <p className="text-sm">Add contacts who should be notified in emergencies</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsList;
