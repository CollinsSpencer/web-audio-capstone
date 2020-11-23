import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { scalePow } from 'd3-scale';
import { select } from 'd3-selection';
import { transform } from 'd3-transform';
import { useAppAudioContext } from '../contexts/AppAudioContext';
import { dateFromSeconds } from '../utils';

const ActiveRecordingTrack = ({ timeScale, sidebarWidth, width }) => {
  const {
    audioAnalyser,
    isRecording,
    startRecordingTimeStamp,
  } = useAppAudioContext();
  const requestRef = useRef();
  const trackRef = useRef();
  const [filteredData, setFilteredData] = useState([]);
  const [trackWidth, setTrackWidth] = useState(0);

  const getFrequencyData = useCallback(() => {
    if (!audioAnalyser) return [];
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }, [audioAnalyser]);

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
    const y = scalePow().exponent(3).domain([0, 255]).range([1, height]);

    const lastElement = filteredData[filteredData.length - 1];
    const barWidth = lastElement
      ? timeScale(dateFromSeconds(lastElement.timeOffset)) / filteredData.length
      : trackWidth / filteredData.length;

    select(trackRef.current)
      .select('g')
      .selectAll('rect')
      .data(filteredData)
      .join('rect')
      .attr(
        'transform',
        transform().translate(({ timeOffset, value }) => [
          timeScale(dateFromSeconds(timeOffset)),
          height / 2 - y(value) / 2,
        ]),
      )
      .attr('class', 'track-audio')
      .attr('width', barWidth)
      .attr('height', ({ value }) => y(value));
  }, [filteredData, timeScale, trackWidth]);

  const animate = useCallback(
    (timestamp) => {
      if (isRecording) {
        const audioData = getFrequencyData();
        const timeOffset = (timestamp - startRecordingTimeStamp) / 1000;

        setTrackWidth(timeScale(dateFromSeconds(timeOffset)));
        setFilteredData([
          ...filteredData,
          { timeOffset, value: Math.max(...audioData) },
        ]);
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setFilteredData([]);
        setTrackWidth(0);
        cancelAnimationFrame(requestRef.current);
      }
    },
    [
      getFrequencyData,
      filteredData,
      timeScale,
      isRecording,
      startRecordingTimeStamp,
    ],
  );

  useEffect(() => {
    cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return (
    <div style={styles.root} className="track recording">
      <div style={styles.sidebar} className="sidebar">
        <span>Recording...</span>
      </div>
      <svg style={styles.svg}>
        <svg ref={trackRef}>
          <rect
            className="track-box"
            textAnchor="start"
            width={trackWidth}
            height={height}
            rx="5"
            ry="5"
          />
          <g />
          {/* <text dx="2" fill="#FFFFFF">
            Track #
          </text> */}
        </svg>
      </svg>
    </div>
  );
};
ActiveRecordingTrack.propTypes = {
  timeScale: PropTypes.func.isRequired,
  sidebarWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default ActiveRecordingTrack;
