import { scaleTime } from 'd3-scale';
import React, { useRef, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useTrackContext } from '../contexts';
import AudioTrack from './AudioTrack';
import PlaybackAxis from './PlaybackAxis';
import PlaybackHead from './PlaybackHead';

const Timeline = () => {
  const { tracks } = useTrackContext();
  const timelineRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const currentPlaybackTime = 0;
  const timelineStartTime = 0;
  const timelineEndTime = 6;

  const timeScale = scaleTime()
    .domain([
      new Date(0, 0, 0, 1, 0, timelineStartTime),
      new Date(0, 0, 0, 1, 0, timelineEndTime),
    ])
    .range([0, dimensions.width]);

  useEffect(() => {
    if (timelineRef) setDimensions(timelineRef.current.getBoundingClientRect());
  }, [timelineRef]);

  return (
    <div ref={timelineRef}>
      <PlaybackHead
        timeScale={timeScale}
        currentPlaybackTime={new Date(0, 0, 0, 1, 0, currentPlaybackTime)}
        height={dimensions.height}
      />
      <PlaybackAxis
        timeScale={timeScale}
        timelineStartTime={timelineStartTime}
        timelineEndTime={timelineEndTime}
        width={dimensions.width}
      />
      {tracks
        ? tracks.map((t) => (
            <AudioTrack
              audio={t.audio}
              name={t.name}
              key={t.name}
              currentPlaybackTime={currentPlaybackTime}
              timelineStartTime={timelineStartTime}
              timelineEndTime={timelineEndTime}
            />
          ))
        : 'record to make your first track'}
    </div>
  );
};
Timeline.propTypes = {};

export default Timeline;
