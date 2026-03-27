import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApi } from "../../hooks/useApi";
import { fetchMyNotifications, markNotificationAsRead } from "../../services/api";
import { Bell, Check, Trash2, MailOpen, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function CustomerNotifications() {
  const { data: notifications, loading, refetch } = useApi(fetchMyNotifications);

  const handleRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      refetch();
    } catch (err) {
      toast.error("Error marking as read");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Retrieving secure messages...</div>;

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit']">Notifications</h1>
          <p className="text-gray-400 mt-1">Updates from your Quantum Financial monitoring system.</p>
        </div>
        <div className="relative">
          <Bell className="text-purple-500" size={32} />
          {notifications?.filter((n: any) => !n.isRead).length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A0A14] flex items-center justify-center text-[8px] font-black text-white">
              {notifications.filter((n: any) => !n.isRead).length}
            </div>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications?.map((notif: any, i: number) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className={`bg-[#141424] border rounded-2xl p-6 flex items-start gap-4 transition-all duration-300
                ${notif.isRead ? 'border-[#1E1E2E] opacity-60' : 'border-purple-500/20 shadow-[0_0_20px_rgba(106,13,173,0.05)]'}
              `}
            >
              <div className={`p-3 rounded-xl shrink-0 ${notif.isRead ? 'bg-[#1A1A2E] text-gray-600' : 'bg-purple-600/10 text-purple-400 font-bold'}`}>
                 {notif.isRead ? <MailOpen size={20} /> : <Mail size={20} />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                   <p className="text-xs font-black uppercase text-gray-600 tracking-widest">System Message</p>
                   <p className="text-xs text-gray-500 font-mono italic">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                <p className={`text-base leading-relaxed ${notif.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                  {notif.message}
                </p>
              </div>

              {!notif.isRead && (
                <button 
                  onClick={() => handleRead(notif.id)}
                  className="p-2 bg-purple-600/10 hover:bg-purple-600 transition-colors text-purple-400 hover:text-white rounded-lg shrink-0"
                  title="Mark as Read"
                >
                  <Check size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications?.length === 0 && (
          <div className="text-center py-20 bg-[#141424] border border-[#1E1E2E] border-dashed rounded-3xl opacity-50">
             <MailOpen className="mx-auto mb-4 text-gray-600" size={48} />
             <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">No active notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
