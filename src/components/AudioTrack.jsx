import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const AudioTrack = ({ audio, name }) => {
  const requestRef = useRef();
  const canvasRef = useRef();

  const styles = {
    width: '100%',
    height: '50px',
    background: 'teal',
    // boxShadow: `${width} 0 #CCCCCC77 inset`,
  };

  const draw = (currentTime, duration) => {
    const canvas = canvasRef.current;
    canvas.width = document.body.clientWidth;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, (canvas.width * currentTime) / duration, canvas.height);
  };

  const animate = useCallback(() => {
    draw(audio.currentTime, audio.duration);
    requestRef.current = requestAnimationFrame(animate);
  }, [audio]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return (
    <div style={styles}>
      <p>{name}</p>
      <button type="button" onClick={() => audio.play()}>
        play
      </button>
      <canvas width="600" height="50" ref={canvasRef} />;
      {/* <audio controls src={audioSource}>
        <track kind="captions" />
      </audio> */}
    </div>
  );
};

AudioTrack.propTypes = {
  audio: PropTypes.instanceOf(HTMLAudioElement).isRequired,
  name: PropTypes.string.isRequired,
};

export default AudioTrack;
