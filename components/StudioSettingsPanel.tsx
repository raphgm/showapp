import React, { useState } from 'react';
import { X } from 'lucide-react';

interface StudioSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  onToggleCamera: (enabled: boolean) => void;
  onToggleMicrophone: (enabled: boolean) => void;
}

const StudioSettingsPanel: React.FC<StudioSettingsPanelProps> = ({
  isOpen,
  onClose,
  cameraEnabled,
  microphoneEnabled,
  onToggleCamera,
  onToggleMicrophone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-[320px]">
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 bg-[#f6f7fb] rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X size={28} />
        </button>
        <h2 className="text-2xl font-black mb-8">Settings</h2>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">Camera</span>
            <button
              className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors ${cameraEnabled ? 'bg-[#6c47ff]' : 'bg-gray-300'}`}
              onClick={() => onToggleCamera(!cameraEnabled)}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${cameraEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">Microphone</span>
            <button
              className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors ${microphoneEnabled ? 'bg-[#6c47ff]' : 'bg-gray-300'}`}
              onClick={() => onToggleMicrophone(!microphoneEnabled)}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${microphoneEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudioSettingsActions: React.FC<{
  onSettings: () => void;
}> = ({ onSettings }) => (
  <div className="fixed top-4 right-8 flex gap-8 z-40">
    {/* Header action buttons removed */}
  </div>
);

export default StudioSettingsPanel;
