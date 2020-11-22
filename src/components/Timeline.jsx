import React, { useRef, useState, useEffect } from 'react';
import { scaleTime } from 'd3-scale';
// import PropTypes from 'prop-types';
import { useAppAudioContext } from '../contexts';
import { dateFromSeconds } from '../utils';
import AudioTrack from './AudioTrack';
import PlaybackAxis from './PlaybackAxis';
import PlaybackHead from './PlaybackHead';
import ActiveRecordingTrack from './ActiveRecordingTrack';

const Timeline = () => {
  const { tracks, isRecording } = useAppAudioContext();
  const timelineRef = useRef();
  const [dimensions, setDimensions] = useState(
    timelineRef.current
      ? timelineRef.current.getBoundingClientRect()
      : { width: 0, height: 0 },
  );

  const timelineStartTime = 0;
  const timelineEndTime = 12;

  const timeScale = scaleTime()
    .domain([
      dateFromSeconds(timelineStartTime),
      dateFromSeconds(timelineEndTime),
    ])
    .range([0, dimensions.width]);

  // if (timelineRef.current) {
  //   const currentDimensions = timelineRef.current.getBoundingClientRect();
  //   if (
  //     dimensions.width !== currentDimensions.width &&
  //     dimensions.height !== currentDimensions.height
  //   ) {
  //     setDimensions(currentDimensions);
  //   }
  // }

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
    <div ref={timelineRef}>
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
