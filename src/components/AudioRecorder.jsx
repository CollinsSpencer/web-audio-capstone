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

  // Source: https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
  const filterData = (audioBuffer) => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = audioBuffer.duration * 50; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i += 1) {
      const blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j += 1) {
        sum += Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    // Normalize data
    // const multiplier = Math.max(...filteredData) ** -1;
    // return filteredData.map((n) => n * multiplier);
    return filteredData;
  };

  useEffect(() => {
    if (audioRecorder) {
      audioRecorder.ondataavailable = (e) => {
        console.log(e);
        audioData.current.push(e.data);
        if (audioData.current.length % 10 === 0) {
          console.log(audioData.current[audioData.current.length - 1]);
        }
      };

      audioRecorder.onstop = async () => {
        console.log(audioData.current[0], audioData.current[1]);
        const blob = new Blob(audioData.current, {
          type: 'audio/wav; codecs=0',
        });
        // const audioURL = window.URL.createObjectURL(blob);
        const audioBuffer = await convertBlobToAudioBuffer(blob);
        const filteredData = filterData(audioBuffer);

        console.log({ audioBuffer }, audioBuffer.length);
        console.log({ filteredData }, filteredData.length);

        const track = {
          // audioURL,
          // audioBlob: blob,
          audioBuffer,
          // audio: new Audio(audioURL),
          filteredData,
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
      <button onClick={handleRecord} type="button" className="secondary">
        {audioRecorder ? 'Stop' : 'Record'}
      </button>
      {/* {tracks && <hr />}
      {JSON.stringify(tracks)} */}
    </>
  );
};

export default AudioRecorder;
