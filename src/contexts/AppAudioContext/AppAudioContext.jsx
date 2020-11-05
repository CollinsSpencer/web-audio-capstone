import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import Crunker from 'crunker';
import { v4 as uuidv4 } from 'uuid';
import { useToastContext } from '../ToastContext';
import { actions, initialState, reducer } from './reducer';

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
  const [audioContextInstance, setAudioContextInstance] = useState();
  const [audioRecorder, setAudioRecorder] = useState();
  const [audioStreamSourceNode, setAudioStreamSourceNode] = useState();
  const [audioElement, setAudioElement] = useState();
  const audioStream = useRef();
  const toast = useToastContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  const getAudioContext = useCallback(() => {
    if (audioContextInstance) return audioContextInstance;
    let audioContext;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextInstance(audioContext);
      return audioContext;
    } catch (e) {
      toast.error('Web Audio API is not supported in this browser', {
        autoClose: false,
      });
      return null;
    }
  }, [audioContextInstance, toast]);

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
  };

  const closeAudioStream = () => {
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((track) => track.stop());
      audioStream.current = null;
    }
  };

  // Based on https://stackoverflow.com/a/57314888/7577035
  // and https://github.com/jackedgson/crunker/blob/master/src/crunker.js
  const mixDown = useCallback(
    (tracks, numberOfChannels = 1) => {
      const audioContext = getAudioContext();
      const maxDuration = Math.max(
        ...tracks.map(
          ({ audioBuffer, offset }) => audioBuffer.duration + offset,
        ),
      );
      // create a buffer using the totalLength and sampleRate of the first buffer node
      const finalMix = audioContext.createBuffer(
        numberOfChannels,
        maxDuration * tracks[0].audioBuffer.sampleRate,
        tracks[0].audioBuffer.sampleRate,
      );

      tracks.forEach((track) => {
        [...Array(numberOfChannels).keys()].forEach((channel) => {
          const buffer = finalMix.getChannelData(channel);
          const start = track.offset * track.audioBuffer.sampleRate;
          track.audioBuffer.getChannelData(channel).forEach((sample, index) => {
            buffer[index + start] += sample;
          });
        });
      });

      return finalMix;
    },
    [getAudioContext],
  );

  useEffect(() => {
    console.log('USE EFFECT');
    const tracks = Object.values(state.tracks);
    if (!tracks || tracks.length === 0) return;
    const audioContext = getAudioContext();
    const merged = mixDown(tracks);
    const crunker = new Crunker(tracks[0].audioBuffer.sampleRate);
    const { blob } = crunker.export(merged, 'audio/mp3');
    const audioURL = (window.URL || window.webkitURL).createObjectURL(blob);
    const audio = new Audio(audioURL);
    setAudioElement(audio);
    const audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(audioContext.destination);
  }, [state.tracks, getAudioContext]);

  const context = useMemo(
    () => ({
      startAnalysing: async () => {
        if (!audioStream.current) await openAudioStream();
        const audioContext = getAudioContext();
        const source = audioContext.createMediaStreamSource(
          audioStream.current,
        );
        const analyserInstance = audioContext.createAnalyser();
        source.connect(analyserInstance);
        source.connect(audioContext.destination);
        setAudioAnalyser(analyserInstance);
        setAudioStreamSourceNode(source);
      },
      stopAnalysing: (close = true) => {
        if (audioAnalyser) audioAnalyser.disconnect();
        if (audioStreamSourceNode) audioStreamSourceNode.disconnect();
        setAudioAnalyser(null);
        setAudioStreamSourceNode(null);
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
      startPlaying: () => {
        audioElement.play();
      },
      getCurrentPlaybackTime: () => {
        // if (audioElement) console.log(audioElement.currentTime);
        return audioElement ? audioElement.currentTime : 0;
      },
      // addAudioSource: async (audioBuffer) => {
      //   const audioContext = getAudioContext();
      //   const audioSource = audioContext.createBufferSource(audioBuffer);
      //   audioSource.connect(audioContext.destination);
      //   console.log('audio connected!', audioSource);
      // },
      audioAnalyser,
      // audioContext: audioContextInstance,
      getAudioContext,
      audioElement,
      audioRecorder,
      tracks: Object.values(state.tracks),
      addTrack: async (track) => {
        console.log(track);
        dispatch(actions.addTrack({ ...track, trackId: uuidv4() }));
      },
      setTrackOffset: (trackId, offset) => {
        dispatch(actions.updateTrackOffset(trackId, offset));
      },
    }),
    [
      audioAnalyser,
      audioElement,
      audioRecorder,
      audioStreamSourceNode,
      getAudioContext,
      // mixDown,
      state.tracks,
    ],
  );

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