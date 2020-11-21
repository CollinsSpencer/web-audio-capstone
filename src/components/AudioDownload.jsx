import React, { useState } from 'react';
import { useAppAudioContext } from '../contexts';
import ModalAudioDownload from './ModalAudioDownload';

const AudioDownload = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { hasAudio } = useAppAudioContext();

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="secondary"
        disabled={!hasAudio}
        onClick={() => setIsOpen(true)}
      >
        Download
      </button>
      <ModalAudioDownload isOpen={isOpen} close={closeModal} />
    </>
  );
};

export default AudioDownload;
