import React from 'react';
import PropTypes from 'prop-types';

const PlaybackHead = ({ timeScale, currentPlaybackTime, height }) => {
  const styles = {
    position: 'absolute',
    height,
    width: 5,
    backgroundColor: 'white',
    left: timeScale(currentPlaybackTime),
  };
  return <div style={styles} />;
};

PlaybackHead.propTypes = {
  timeScale: PropTypes.func.isRequired,
  currentPlaybackTime: PropTypes.instanceOf(Date).isRequired,
  height: PropTypes.number.isRequired,
};

export default PlaybackHead;
