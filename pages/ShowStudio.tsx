import React from 'react';
import ShowStudioSuite from '../components/ShowStudio';

const ShowStudioPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return <ShowStudioSuite onClose={onClose || (() => window.history.back())} />;
};

export default ShowStudioPage;
