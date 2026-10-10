/**
 * Notification Toast Component
 */

import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertTriangle, XCircle, Coins, X } from 'lucide-react';

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none select-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-[#35D9F2]/40';
        let iconColor = 'text-[#35D9F2]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-[#63F5C8]/40';
          iconColor = 'text-[#63F5C8]';
        } else if (toast.type === 'energy') {
          Icon = Coins;
          borderClass = 'border-[#F7C85B]/40';
          iconColor = 'text-[#F7C85B]';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-[#F7C85B]/40';
          iconColor = 'text-[#F7C85B]';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-[#FF796C]/40';
          iconColor = 'text-[#FF796C]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-none p-3.5 rounded-xl border bg-[#102C40] shadow-xl flex items-start gap-3 transition-all transform ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-[#F5FAFC] tracking-wide">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-[#A9C0CE] mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#A9C0CE] hover:text-[#F5FAFC] p-1 pointer-events-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
