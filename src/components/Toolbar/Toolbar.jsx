import React from 'react';
import AudioPlayback from '../AudioPlayback';
import AudioRecorder from '../AudioRecorder';

const Toolbar = () => {
  return (
    <div className="toolbar">
      <AudioRecorder />
      <AudioPlayback />
    </div>
  );
};

export default Toolbar;
