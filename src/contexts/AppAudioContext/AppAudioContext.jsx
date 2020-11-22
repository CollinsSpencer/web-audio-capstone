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
import { v4 as uuidv4 } from 'uuid';
import { useToastContext } from '../ToastContext';
import { actions, initialState, reducer } from './reducer';
import { bufferToWave } from '../../utils/audio';

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
  const [isRecording, setIsRecording] = useState();
  const [startRecordingTimeStamp, setStartRecordingTimeStamp] = useState();
  const [pauseRecordingTimeStamp, setPauseRecordingTimeStamp] = useState();
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
    const { blob } = bufferToWave(
      merged,
      'audio/wav; codecs=0',
      tracks[0].audioBuffer.sampleRate,
    );
    const audioURL = (window.URL || window.webkitURL).createObjectURL(blob);
    const audio = new Audio(audioURL);
    setAudioElement(audio);
    const audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(audioContext.destination);
  }, [state.tracks, getAudioContext, mixDown]);

  const downloadFile = useCallback(
    (fileName) => {
      const { currentSrc: url } = audioElement;
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 0);
    },
    [audioElement],
  );

  const startAnalysing = useCallback(async () => {
    if (!audioStream.current) await openAudioStream();
    const audioContext = getAudioContext();
    const source = audioContext.createMediaStreamSource(audioStream.current);
    const analyserInstance = audioContext.createAnalyser();
    source.connect(analyserInstance);
    source.connect(audioContext.destination);
    setAudioAnalyser(analyserInstance);
    setAudioStreamSourceNode(source);
  }, [getAudioContext]);

  const stopAnalysing = useCallback(
    (close = true) => {
      if (audioAnalyser) audioAnalyser.disconnect();
      if (audioStreamSourceNode) audioStreamSourceNode.disconnect();
      setAudioAnalyser(null);
      setAudioStreamSourceNode(null);
      if (close) closeAudioStream();
    },
    [audioAnalyser, audioStreamSourceNode],
  );

  const context = useMemo(
    () => ({
      startAnalysing,
      stopAnalysing,
      startRecording: async () => {
        if (!audioStream.current) await openAudioStream();
        if (!audioRecorder) {
          const mediaRecorder = new window.MediaRecorder(audioStream.current, {
            mimeType: 'audio/webm;codecs=pcm',
          });
          setAudioRecorder(mediaRecorder);
          mediaRecorder.start();
          setStartRecordingTimeStamp(performance.now());
          await startAnalysing();
        } else {
          audioRecorder.resume();
          setStartRecordingTimeStamp(
            startRecordingTimeStamp +
              (performance.now() - pauseRecordingTimeStamp),
          );
          setPauseRecordingTimeStamp(null);
        }
        setIsRecording(true);
      },
      pauseRecording: () => {
        if (audioRecorder) audioRecorder.pause();
        setPauseRecordingTimeStamp(performance.now());
      },
      stopRecording: (close = true) => {
        setIsRecording(false);
        if (audioRecorder) audioRecorder.stop();
        setStartRecordingTimeStamp(null);
        setPauseRecordingTimeStamp(null);
        setAudioRecorder(null);
        stopAnalysing(close);
        if (close) closeAudioStream();
      },
      startRecordingTimeStamp,
      // filteredAudioRecordingData,
      // setFilteredAudioRecordingData,
      startPlaying: () => {
        audioElement.play();
      },
      downloadAudio: (fileName) => {
        const extension = '.wav';
        const name = !fileName || fileName.length === 0 ? 'audio' : fileName;
        downloadFile(`${name}${extension}`);
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
      hasAudio: !!audioElement,
      isRecording,
    }),
    [
      startAnalysing,
      stopAnalysing,
      audioAnalyser,
      audioElement,
      audioRecorder,
      pauseRecordingTimeStamp,
      startRecordingTimeStamp,
      downloadFile,
      getAudioContext,
      state.tracks,
      isRecording,
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
