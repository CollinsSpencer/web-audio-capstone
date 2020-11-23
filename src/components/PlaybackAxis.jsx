/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { axisBottom } from 'd3-axis';
import { timeSecond, timeMinute, timeHour } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { select, selectAll } from 'd3-selection';

const PlaybackAxis = ({ timeScale, width }) => {
  const formatMillisecond = timeFormat('.%L');
  const formatSecond = timeFormat(':%S');
  const formatMinute = timeFormat(':%M:%S');
  const formatHour = timeFormat('%H:%M:%S');

  const multiFormat = (date) => {
    return (timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
      ? formatMinute
      : formatHour)(date);
  };

  const styles = {
    height: 25,
    width,
    color: 'white',
  };

  const xAxisRef = useRef();

  const xAxis = axisBottom(timeScale)
    .tickFormat(multiFormat)
    .tickSize('100')
    .tickPadding('0');

  useEffect(() => {
    if (xAxisRef.current) {
      xAxis(select(xAxisRef.current).attr('font-size', '1em'));
      selectAll('text')
        .attr('y', '0')
        .attr('x', '3')
        .attr('dy', '1em')
        .style('text-anchor', 'start');
    }
  });

  return (
    <svg style={styles}>
      <g ref={xAxisRef} textAnchor="start" />
    </svg>
  );
};

PlaybackAxis.propTypes = {
  timeScale: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
};

export default PlaybackAxis;
