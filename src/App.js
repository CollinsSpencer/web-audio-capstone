import React, { useState } from 'react';
import AudioAnalyser from './components/AudioAnalyser';

const App = () => {
  const [audio, setAudio] = useState();

  const getMicrophone = async () => {
    const audioMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setAudio(audioMedia);
  };

  const stopMicrophone = () => {
    audio.getTracks().forEach((track) => track.stop());
    setAudio(null);
  };

  const toggleMicrophone = () => {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();
    }
  };

  return (
    <div className="App">
      <div className="controls">
        <button onClick={toggleMicrophone} type="button">
          {audio ? 'Stop microphone' : 'Get microphone input'}
        </button>
      </div>
      <AudioAnalyser audio={audio} />
    </div>
  );
};

export default App;
