import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { max, range } from 'd3-array';
import { dateFromSeconds, secondsFromDate } from '../utils';
import { useAppAudioContext } from '../contexts';

const AudioTrack = ({
  trackId,
  filteredData,
  name,
  timeScale,
  audioDuration,
}) => {
  const { setTrackOffset } = useAppAudioContext();
  const trackRef = useRef();
  const trackWidth = timeScale(dateFromSeconds(audioDuration));
  const height = 50;

  const styles = {
    root: {
      height: `${height}px`,
    },
    svg: {
      width: '100%',
      height: `${height}px`,
    },
  };

  useEffect(() => {
    if (trackRef.current) {
      select(trackRef.current).call(
        drag()
          .subject(() => {
            const me = select(trackRef.current);
            return { x: me.attr('x'), y: me.attr('y') };
          })
          .on('drag', (event) => {
            select(trackRef.current).attr('x', event.x);
          })
          .on('end', () => {
            const x = select(trackRef.current).attr('x');
            const offset = secondsFromDate(timeScale.invert(x));
            setTrackOffset(trackId, offset);
          }),
      );
    }
  }, [setTrackOffset, timeScale, trackId]);

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
      .attr(
        'transform',
        (d, i) => `translate(${x(i)}, ${height / 2 - y(d) / 2})`,
      )
      .attr('class', 'track-audio')
      .attr('width', x.bandwidth())
      .attr('height', y);
  }, [filteredData, trackWidth]);

  return (
    <div style={styles.root} className="track">
      <svg style={styles.svg}>
        <svg ref={trackRef}>
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
          <text dx="2" fill="#FFFFFF">
            {name}
          </text>
        </svg>
      </svg>
    </div>
  );
};

AudioTrack.propTypes = {
  audioDuration: PropTypes.number.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.number).isRequired,
  name: PropTypes.string.isRequired,
  timeScale: PropTypes.func.isRequired,
  trackId: PropTypes.string.isRequired,
};

export default AudioTrack;
