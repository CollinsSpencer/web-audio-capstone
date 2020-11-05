import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { dateFromSeconds } from '../utils';
import { useAppAudioContext } from '../contexts';

const PlaybackHead = ({ timeScale }) => {
  const playbackHeadRef = useRef();
  const requestRef = useRef();
  const { getCurrentPlaybackTime } = useAppAudioContext();

  const draw = useCallback(
    (currentPlaybackTime) => {
      const x = timeScale(dateFromSeconds(currentPlaybackTime));
      if (playbackHeadRef.current) {
        select(playbackHeadRef.current).attr('transform', `translate(${x}, 0)`);
        // select(playbackHeadRef.current).attr('x', x);
      }
    },
    [timeScale],
  );

  const outputTimestamps = useCallback(() => {
    const currentPlaybackTime = getCurrentPlaybackTime();
    draw(currentPlaybackTime);
    requestRef.current = requestAnimationFrame(outputTimestamps);
  }, [getCurrentPlaybackTime, draw]);

  useEffect(() => {
    // cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(outputTimestamps);
    return () => cancelAnimationFrame(requestRef.current);
  }, [outputTimestamps]);

  const styles = {
    position: 'absolute',
    height: 28,
    width: '100%',
  };
  return (
    <svg style={styles}>
      <g ref={playbackHeadRef}>
        <path d="M -8,10 L -8,20 L 0,28 L 8,20 L 8,10 z" fill="white" />
      </g>
    </svg>
  );
};

PlaybackHead.propTypes = {
  timeScale: PropTypes.func.isRequired,
};

export default PlaybackHead;
