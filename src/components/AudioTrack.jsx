import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max, range } from 'd3-array';
import { dateFromSeconds, secondsFromDate } from '../utils';
import { useAppAudioContext } from '../contexts/AppAudioContext';
import { useToastContext } from '../contexts/ToastContext';

const AudioTrack = ({
  trackId,
  filteredData,
  name,
  timeScale,
  audioDuration,
  audioOffset,
  timelineStartTime,
  timelineEndTime,
  sidebarWidth,
  width,
}) => {
  const toast = useToastContext();
  const { setTrackOffset, deleteTrack } = useAppAudioContext();
  const trackRef = useRef();
  const visibleTrackStartTime = Math.max(timelineStartTime, audioOffset);
  const visibleTrackEndTime = Math.min(
    timelineEndTime,
    audioOffset + audioDuration,
  );
  const visibleTrackWidth =
    timeScale(dateFromSeconds(visibleTrackEndTime)) -
    timeScale(dateFromSeconds(visibleTrackStartTime));
  const startPercentile = Math.max(
    0,
    (visibleTrackStartTime - audioOffset) / audioDuration,
  );
  const endPercentile = Math.min(
    1,
    (visibleTrackEndTime - audioOffset) / audioDuration,
  );
  const trackWidth = visibleTrackWidth / (endPercentile - startPercentile);

  const offsetPosition = timeScale(dateFromSeconds(audioOffset));
  const height = 50;

  const styles = {
    root: {
      height: `${height}px`,
      display: 'flex',
      flexDirection: 'row',
    },
    sidebar: {
      width: sidebarWidth,
    },
    svg: {
      width,
      height: `${height}px`,
    },
  };

  useEffect(() => {
    if (trackRef.current) {
      select(trackRef.current).call(
        drag()
          .subject(() => {
            const me = select(trackRef.current);
            return { x: me.attr('x') };
          })
          .on('drag', (event) => {
            select(trackRef.current).attr('x', event.x);
            const offset = select(trackRef.current).attr('x');
            select(trackRef.current)
              .select('text')
              .attr('dx', offset < 0 ? -offset : 2);
          })
          .on('end', () => {
            const x = select(trackRef.current).attr('x');
            const offset = secondsFromDate(timeScale.invert(x));
            if (offset + audioDuration > 0) setTrackOffset(trackId, offset);
            else {
              select(trackRef.current).attr('x', offsetPosition);
              select(trackRef.current).select('text').attr('dx', 2);
              toast.warn('Invalid track offset');
            }
          }),
      );
    }
  }, [
    setTrackOffset,
    timeScale,
    trackId,
    audioDuration,
    offsetPosition,
    toast,
  ]);

  useEffect(() => {
    const x = scaleBand()
      .domain(range(filteredData.length))
      .range([0, trackWidth]);

    const y = scaleLinear()
      .domain([0, max(filteredData)])
      .range([1, height]);

    select(trackRef.current)
      .select('g')
      .selectAll('rect')
      .data(filteredData)
      .join('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', (d) => height / 2 - y(d) / 2)
      .attr('class', 'track-audio')
      .attr('width', x.bandwidth())
      .attr('height', y);
  }, [filteredData, trackWidth, timelineStartTime, timelineEndTime]);

  const handleDelete = () => {
    deleteTrack(trackId);
  };

  return (
    <div style={styles.root} className="track">
      <div style={styles.sidebar} className="sidebar">
        <div>
          <button type="button" className="icon" onClick={handleDelete}>
            <span role="img" aria-label="Delete" title="Delete track">
              ❌
            </span>
          </button>
        </div>
      </div>

      <svg style={styles.svg}>
        <svg ref={trackRef} x={offsetPosition}>
          <rect
            className="track-box"
            style={styles.rect}
            textAnchor="start"
            width={trackWidth}
            height={height}
            rx="5"
            ry="5"
          />
          <g />
          <text dx={offsetPosition < 0 ? -offsetPosition : 2} fill="#FFFFFF">
            {name}
          </text>
        </svg>
      </svg>
    </div>
  );
};

AudioTrack.propTypes = {
  audioDuration: PropTypes.number.isRequired,
  audioOffset: PropTypes.number.isRequired,
  timelineStartTime: PropTypes.number.isRequired,
  timelineEndTime: PropTypes.number.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.number).isRequired,
  name: PropTypes.string.isRequired,
  timeScale: PropTypes.func.isRequired,
  trackId: PropTypes.string.isRequired,
  sidebarWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default AudioTrack;
