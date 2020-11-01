import React, { useEffect, useRef } from 'react';
import { useAppAudioContext, useTrackContext } from '../contexts';

const AudioRecorder = () => {
  const { tracks, addTrack } = useTrackContext();
  const audioData = useRef([]);
  const { audioRecorder, startRecording, stopRecording } = useAppAudioContext();

  const handleRecord = async () => {
    if (audioRecorder) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    if (audioRecorder) {
      audioRecorder.ondataavailable = (e) => {
        audioData.current.push(e.data);
      };

      audioRecorder.onstop = () => {
        const blob = new Blob(audioData.current, {
          type: 'audio/ogg; codecs=opus',
        });
        const audioURL = window.URL.createObjectURL(blob);
        const track = {
          audioURL,
          audioBlob: blob,
          audio: new Audio(audioURL),
          name: `Take #${tracks.length + 1}`,
        };
        addTrack(track);
        audioData.current = [];
      };
    }
  }, [addTrack, audioData, audioRecorder, tracks]);

  return (
    <>
      <button onClick={handleRecord} type="button">
        {audioRecorder ? 'Stop' : 'Record'}
      </button>
      {/* {tracks && <hr />}
      {JSON.stringify(tracks)} */}
    </>
  );
};

export default AudioRecorder;
