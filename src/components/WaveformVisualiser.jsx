import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const WaveformVisualiser = ({ getTimeDomainData }) => {
  const canvasRef = useRef();
  const wrapperRef = useRef();
  const requestRef = useRef();

  const draw = (audioData) => {
    const canvas = canvasRef.current;
    const { width: wrapperWidth } = wrapperRef.current.getBoundingClientRect();
    canvas.width = wrapperWidth;
    const { height, width } = canvas;
    const context = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    audioData.forEach((item) => {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    });
    context.lineTo(x, height / 2);
    context.stroke();
  };

  const animate = useCallback(() => {
    const audioData = getTimeDomainData();
    draw(audioData);
    requestRef.current = requestAnimationFrame(animate);
  }, [getTimeDomainData]);

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

WaveformVisualiser.propTypes = {
  getTimeDomainData: PropTypes.func.isRequired,
};

export default WaveformVisualiser;
