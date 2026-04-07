import React from 'react';
import ShowStudioSuite from '../components/ShowStudio';
import type { Video } from '../types';

const ShowStudioPage: React.FC<{ onClose?: () => void; onSave?: (video: Video) => void }> = ({ onClose, onSave }) => {
  return <ShowStudioSuite onClose={onClose || (() => window.history.back())} onSave={onSave} />;
};

export default ShowStudioPage;
