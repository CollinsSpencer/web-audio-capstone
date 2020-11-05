import React, { useCallback, useEffect, useRef } from 'react';
import { useAppAudioContext } from '../contexts';

const AudioRecorder = () => {
  const audioData = useRef([]);
  const {
    audioRecorder,
    getAudioContext,
    startRecording,
    stopRecording,
    tracks,
    addTrack,
  } = useAppAudioContext();

  const handleRecord = async () => {
    if (audioRecorder) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const convertBlobToAudioBuffer = useCallback(
    async (blob) => {
      const audioContext = getAudioContext();
      const fileReader = new FileReader();

      return new Promise((resolve) => {
        fileReader.onloadend = () => {
          const arrayBuffer = fileReader.result;

          audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            resolve(audioBuffer);
          });
        };

        // Load blob
        fileReader.readAsArrayBuffer(blob);
      });
    },
    [getAudioContext],
  );

  useEffect(() => {
    if (audioRecorder) {
      audioRecorder.ondataavailable = (e) => {
        audioData.current.push(e.data);
      };

      audioRecorder.onstop = async () => {
        const blob = new Blob(audioData.current, {
          type: 'audio/ogg; codecs=opus',
        });
        // const audioURL = window.URL.createObjectURL(blob);
        const audioBuffer = await convertBlobToAudioBuffer(blob);

        const track = {
          // audioURL,
          // audioBlob: blob,
          audioBuffer,
          // audio: new Audio(audioURL),
          offset: 0,
          name: `Take #${tracks.length + 1}`,
        };
        addTrack(track);
        audioData.current = [];
      };
    }
  }, [addTrack, audioData, audioRecorder, tracks, convertBlobToAudioBuffer]);

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
