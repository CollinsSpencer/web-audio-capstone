import React from 'react';
import AudioPlayback from '../AudioPlayback';
import AudioRecorder from '../AudioRecorder';
import AudioDownload from '../AudioDownload';

const Toolbar = () => {
  return (
    <div className="toolbar">
      <AudioRecorder />
      <AudioPlayback />
      <AudioDownload />
    </div>
  );
};

export default Toolbar;
