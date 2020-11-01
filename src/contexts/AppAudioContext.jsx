import React, { createContext, useContext, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useToastContext } from './ToastContext';

const defaultContext = {
  open: () => null,
  close: () => null,
  audioStream: null,
  audioContext: null,
};
const AppAudioContext = createContext(defaultContext);

export const useAppAudioContext = () => useContext(AppAudioContext);
export const AppAudioContextProvider = ({ children }) => {
  const [audioAnalyser, setAudioAnalyser] = useState();
  const [audioContext, setAudioContext] = useState();
  const [audioRecorder, setAudioRecorder] = useState();
  const [audioSourceNode, setAudioSourceNode] = useState();
  const audioStream = useRef();
  const toast = useToastContext();

  const startAudioContext = () => {
    if (audioContext) return;
    let audioContextInstance;
    try {
      audioContextInstance = new (window.AudioContext ||
        window.webkitAudioContext)();
      setAudioContext(audioContextInstance);
    } catch (e) {
      toast.error('Web Audio API is not supported in this browser', {
        autoClose: false,
      });
    }
  };

  // const closeAudioContext = () => {
  //   if (audioContext) audioContext.close();
  //   setAudioContext(null);
  // };

  const openAudioStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    audioStream.current = mediaStream;
    startAudioContext();
  };

  const closeAudioStream = () => {
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((track) => track.stop());
      audioStream.current = null;
    }
  };

  const context = {
    startAnalysing: async () => {
      if (!audioStream.current) await openAudioStream();
      const source = audioContext.createMediaStreamSource(audioStream.current);
      const analyserInstance = audioContext.createAnalyser();
      source.connect(analyserInstance);
      source.connect(audioContext.destination);
      setAudioAnalyser(analyserInstance);
      setAudioSourceNode(source);
    },
    stopAnalysing: (close = true) => {
      if (audioAnalyser) audioAnalyser.disconnect();
      if (audioSourceNode) audioSourceNode.disconnect();
      setAudioAnalyser(null);
      setAudioSourceNode(null);
      if (close) closeAudioStream();
    },
    startRecording: async () => {
      if (!audioStream.current) await openAudioStream();
      if (!audioRecorder) {
        const mediaRecorder = new window.MediaRecorder(audioStream.current);
        setAudioRecorder(mediaRecorder);
        mediaRecorder.start();
      } else {
        audioRecorder.resume();
      }
    },
    pauseRecording: () => {
      if (audioRecorder) audioRecorder.pause();
    },
    stopRecording: (close = true) => {
      if (audioRecorder) audioRecorder.stop();
      setAudioRecorder(null);
      if (close) closeAudioStream();
    },
    audioAnalyser,
    audioContext,
    audioRecorder,
  };

  return (
    <AppAudioContext.Provider value={context}>
      {children}
    </AppAudioContext.Provider>
  );
};

AppAudioContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
