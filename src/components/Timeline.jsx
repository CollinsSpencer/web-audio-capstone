import React, { useRef, useState, useEffect } from 'react';
import { scaleTime } from 'd3-scale';
// import PropTypes from 'prop-types';
import { useAppAudioContext } from '../contexts';
import { dateFromSeconds } from '../utils';
import AudioTrack from './AudioTrack';
import PlaybackAxis from './PlaybackAxis';
import PlaybackHead from './PlaybackHead';
import ActiveRecordingTrack from './ActiveRecordingTrack';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';

const Timeline = () => {
  const { audioElement, tracks, isRecording } = useAppAudioContext();
  const timelineRef = useRef();
  const [audioDuration, setAudioDuration] = useState(0);
  const minTime = 0;
  const maxTime = Math.max(audioDuration * 1.1, 2);
  const shortestTime = 0.5;
  const [timelineStartTime, setTimelineStartTime] = useState(minTime);
  const [timelineEndTime, setTimelineEndTime] = useState(maxTime);
  const [dimensions, setDimensions] = useState(
    timelineRef.current
      ? timelineRef.current.getBoundingClientRect()
      : { width: 0, height: 0 },
  );
  const getKeys = useKeyboardShortcut(['Shift', 'Alt'], () => null);

  const timeScale = scaleTime()
    .domain([
      dateFromSeconds(timelineStartTime),
      dateFromSeconds(timelineEndTime),
    ])
    .range([0, dimensions.width]);

  const handleWheel = (event) => {
    const { deltaY } = event;
    const { shift, alt } = getKeys();

    if (shift && alt) {
      // Zoom Horizontally
      // Try just moving the end time
      const newEndTime =
        deltaY > 0
          ? // Zoom out
            timelineEndTime * 1.1
          : // Zoom in
            Math.max(timelineStartTime + shortestTime, timelineEndTime * 0.9);
      if (newEndTime <= maxTime) {
        setTimelineEndTime(newEndTime);
      } else {
        // Move the start time up if needed
        const overshotTime = newEndTime - maxTime;
        const newStartTime = timelineStartTime - overshotTime;
        setTimelineEndTime(maxTime);
        if (newStartTime >= minTime) {
          setTimelineStartTime(newStartTime);
        } else {
          setTimelineStartTime(minTime);
        }
      }
    } else if (shift) {
      // Scroll Horizontally
      const scrollAmount = (timelineEndTime - timelineStartTime) / 6;
      if (deltaY > 0) {
        // Scroll Right
        const offset =
          timelineEndTime + scrollAmount > maxTime
            ? maxTime - timelineEndTime
            : scrollAmount;
        setTimelineStartTime(timelineStartTime + offset);
        setTimelineEndTime(timelineEndTime + offset);
      } else {
        // Scroll Left
        const offset =
          timelineStartTime - scrollAmount < minTime
            ? timelineStartTime - minTime
            : scrollAmount;
        setTimelineStartTime(timelineStartTime - offset);
        setTimelineEndTime(timelineEndTime - offset);
      }
    }
  };

  useEffect(() => {
    const handleDurationChange = () => {
      if (audioElement.duration !== Infinity)
        setAudioDuration(audioElement.duration);
    };
    if (audioElement)
      audioElement.addEventListener('durationchange', handleDurationChange);
    return () => {
      if (audioElement)
        audioElement.removeEventListener(
          'durationchange',
          handleDurationChange,
        );
    };
  }, [audioElement]);

  useEffect(() => {
    const handleResize = () => {
      if (timelineRef.current)
        setDimensions(timelineRef.current.getBoundingClientRect());
      else
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth,
        });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [timelineRef]);

  const trackPlaceholder = !isRecording ? (
    <h3 style={{ color: 'white' }}>
      Click &quot;Record&quot; to make your first track
    </h3>
  ) : null;

  return (
    <div ref={timelineRef} onWheel={handleWheel}>
      <PlaybackHead timeScale={timeScale} />
      <PlaybackAxis
        timeScale={timeScale}
        timelineStartTime={timelineStartTime}
        timelineEndTime={timelineEndTime}
        width={dimensions.width}
      />
      {tracks && tracks.length > 0
        ? tracks.map((t) => (
            <AudioTrack
              timeScale={timeScale}
              audioDuration={t.audioBuffer.duration}
              filteredData={t.filteredData}
              name={t.name}
              trackId={t.trackId}
              key={t.name}
            />
          ))
        : trackPlaceholder}
      {isRecording && (
        <ActiveRecordingTrack timeScale={timeScale} key="active-recording" />
      )}
    </div>
  );
};
Timeline.propTypes = {};

export default Timeline;
