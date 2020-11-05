import React from 'react';
import { useAppAudioContext } from '../contexts';

const AudioPlayback = () => {
  const { startPlaying } = useAppAudioContext();
  // const audioData = useRef([]);
  // const { audioContext } = useAppAudioContext();

  const handlePlay = async () => {
    // if (audioContext) {
    //   stopRecording();
    // } else {
    //   await startRecording();
    // }
    startPlaying();
  };

  return (
    <>
      <button onClick={handlePlay} type="button">
        Play
      </button>
      {/* {tracks && <hr />}
      {JSON.stringify(tracks)} */}
    </>
  );
};

export default AudioPlayback;
