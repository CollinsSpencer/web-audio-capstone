import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { dateFromSeconds, secondsFromDate } from '../utils';
import { useAppAudioContext } from '../contexts/AppAudioContext';

const PlaybackHead = ({ timeScale, width }) => {
  const playbackHeadRef = useRef();
  const requestRef = useRef();
  const draggingRef = useRef(false);
  const {
    getCurrentPlaybackTime,
    setPlaybackHeadOffset,
  } = useAppAudioContext();

  const draw = useCallback(
    (currentPlaybackTime) => {
      const x = timeScale(dateFromSeconds(currentPlaybackTime));
      if (playbackHeadRef.current && !draggingRef.current) {
        select(playbackHeadRef.current).attr('x', x);
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

  useEffect(() => {
    if (playbackHeadRef.current) {
      select(playbackHeadRef.current).call(
        drag()
          .subject(() => {
            const me = select(playbackHeadRef.current);
            return { x: me.attr('x') };
          })
          .on('drag', (event) => {
            draggingRef.current = true;
            select(playbackHeadRef.current).attr('x', event.x);
          })
          .on('end', () => {
            const x = select(playbackHeadRef.current).attr('x');
            const offset = secondsFromDate(timeScale.invert(x));
            setPlaybackHeadOffset(offset);
            draggingRef.current = false;
          }),
      );
    }
  }, [setPlaybackHeadOffset, timeScale]);

  const handleClick = (event) => {
    const offset = secondsFromDate(
      timeScale.invert(event.pageX || event.clientX),
    );
    setPlaybackHeadOffset(offset);
  };

  const styles = {
    position: 'absolute',
    height: '28',
    width,
  };
  return (
    <svg style={styles} onClick={handleClick}>
      <svg ref={playbackHeadRef} style={{ overflow: 'auto' }}>
        <path d="M -8,10 L -8,20 L 0,28 L 8,20 L 8,10 z" fill="white" />
      </svg>
    </svg>
  );
};

PlaybackHead.propTypes = {
  timeScale: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
};

export default PlaybackHead;
