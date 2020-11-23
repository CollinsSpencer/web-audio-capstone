import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const FrequencyVisualiser = ({ getFrequencyData }) => {
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const requestRef = useRef();

  const draw = (audioData) => {
    const canvas = canvasRef.current;
    const { width: wrapperWidth } = wrapperRef.current.getBoundingClientRect();
    canvas.width = wrapperWidth;
    const { height, width } = canvas;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    let x = 0;
    const barWidth = width / audioData.length;

    audioData.forEach((uint8Value) => {
      const barHeight = uint8Value;
      const r = uint8Value;
      const g = (255 - uint8Value) / 2;
      const b = (255 - uint8Value) / 4;
      context.fillStyle = `rgb(${r},${g},${b})`;
      context.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
      x += barWidth;
    });
  };

  const animate = useCallback(() => {
    const audioData = getFrequencyData();
    draw(audioData);
    requestRef.current = requestAnimationFrame(animate);
  }, [getFrequencyData]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return (
    <div style={{ width: '100%' }} ref={wrapperRef}>
      <canvas width="600" height="256" ref={canvasRef} />
    </div>
  );
};

FrequencyVisualiser.propTypes = {
  getFrequencyData: PropTypes.func.isRequired,
};

export default FrequencyVisualiser;
