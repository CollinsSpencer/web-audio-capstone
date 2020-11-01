import React from 'react';
import { useAppAudioContext } from '../contexts';
import WaveformVisualiser from './WaveformVisualiser';
import FrequencyVisualiser from './FrequencyVisualiser';

const AudioAnalyser = () => {
  const { audioAnalyser, startAnalysing, stopAnalysing } = useAppAudioContext();

  const toggleMicrophone = () => {
    if (audioAnalyser) {
      stopAnalysing();
    } else {
      startAnalysing();
    }
  };

  const getTimeDomainData = () => {
    if (!audioAnalyser) return [];
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioAnalyser.getByteTimeDomainData(dataArray);
    return dataArray;
  };
  const getFrequencyData = () => {
    if (!audioAnalyser) return [];
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  };

  return (
    <>
      <div className="record">
        <button onClick={toggleMicrophone} type="button">
          {audioAnalyser ? 'Stop microphone' : 'Get microphone input'}
        </button>
      </div>

      {audioAnalyser && (
        <>
          <WaveformVisualiser getTimeDomainData={getTimeDomainData} />
          <FrequencyVisualiser getFrequencyData={getFrequencyData} />
        </>
      )}
    </>
  );
};

export default AudioAnalyser;
