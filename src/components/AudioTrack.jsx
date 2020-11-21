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
  // const requestRef = useRef();
  const trackRef = useRef();
  // const [audioDuration, setAudioDuration] = useState(0);
  const trackWidth = timeScale(dateFromSeconds(audioDuration));
  const height = 50;

  const styles = {
    root: {
      width: '100%',
      height: `${height}px`,
      textAlign: 'left',
      borderBottom: '1px solid grey',
    },
    svg: {
      width: '100%',
      height: `${height}px`,
    },
    rect: {
      fill: '#3579A9',
    },
    // boxShadow: `${width} 0 #CCCCCC77 inset`,
  };

  // useEffect(() => {
  //   const handleMetadata = () => {
  //     /* eslint-disable no-param-reassign */
  //     // handle chrome's bug
  //     if (audio.duration === Infinity) {
  //       console.log('FIX BUG');
  //       // set it to bigger than the actual duration
  //       audio.currentTime = 1e101;
  //       audio.ontimeupdate = () => {
  //         audio.ontimeupdate = () => {};
  //         audio.currentTime = 0;
  //       };
  //     }
  //   };
  //   const handleDurationChange = () => {
  //     if (audio.duration !== Infinity) setAudioDuration(audio.duration);
  //   };
  //   handleMetadata();
  //   audio.addEventListener('loadedmetadata', handleMetadata);
  //   audio.addEventListener('durationchange', handleDurationChange);
  //   return () => {
  //     audio.removeEventListener('loadedmetadata', handleMetadata);
  //     audio.removeEventListener('durationchange', handleDurationChange);
  //   };
  // }, [audio]);

  // const draw = (duration) => {
  //   console.log(duration);
  // };

  // const refresh = useCallback(() => {
  //   draw(audio.duration);
  //   console.log('refresh', audio.duration);
  //   if (audio.duration) {
  //     trackWidth.current = timeScale(dateFromSeconds(audio.duration));
  //     console.log('set width', audio.duration);
  //   } else requestRef.current = requestAnimationFrame(refresh);
  // }, [audio]);

  // useEffect(() => {
  //   requestRef.current = requestAnimationFrame(refresh);
  //   console.log('refresh Frame');
  //   return () => cancelAnimationFrame(requestRef.current);
  // }, [refresh]);

  // const draw = useCallback(
  //   (duration) => {
  //     console.log('draw');
  //     const trackRect = select(trackRef.current);
  //     // console.log(trackRef.current, trackRect);
  //     trackRect.attr('width', timeScale(dateFromSeconds(duration)));
  //     // const ctx = canvas.getContext('2d');
  //     // ctx.fillStyle = 'blue';
  //     // ctx.fillRect(0, 0, timeScale(dateFromSeconds(currentTime)), canvas.height);
  //   },
  //   [timeScale],
  // );
  // useEffect(() => {
  //   if (audioDuration) {
  //     console.log('predraw');
  //     // draw(audioDuration);
  //     trackWidth.current = timeScale(dateFromSeconds(audioDuration));
  //   }
  //   // requestRef.current = requestAnimationFrame(animate);
  // }, [audioDuration, timeScale]);

  useEffect(() => {
    console.log('USE EFFECT');
    if (trackRef.current) {
      select(trackRef.current).call(
        drag()
          .subject(() => {
            const me = select(trackRef.current);
            return { x: me.attr('x'), y: me.attr('y') };
          })
          .on('drag', (event) => {
            console.log('DRAG');
            select(trackRef.current).attr('x', event.x);
          })
          .on('end', () => {
            const x = select(trackRef.current).attr('x');
            const offset = secondsFromDate(timeScale.invert(x));
            setTrackOffset(trackId, offset);
            console.log({ x, offset });
          }),
      );
    }
  }, [setTrackOffset, timeScale, trackId]);

  // const drawTrack = () => {
  // const xAxis = axisBottom(timeScale)
  //   .tickFormat(multiFormat)
  //   .tickSize('100')
  //   .tickPadding('0');
  // const xAxisRef = (axis) => {
  //   if (axis) {
  //     xAxis(select(axis).attr('font-size', '1em'));
  //     selectAll('text')
  //       .attr('y', '0')
  //       .attr('x', '3')
  //       .attr('dy', '1em')
  //       .style('text-anchor', 'start');
  //   }
  // };

  //   const rectRef = (element) => {
  //     if (element) {
  //       const handleDrag = drag(select(element));
  //       // .subject(() => {
  //       //   const me = select(element);
  //       //   return { x: me.attr('x'), y: me.attr('y') };
  //       // })
  //       // .on('drag', () => {
  //       //   const me = select(element);
  //       //   me.attr('x', d3.event.x);
  //       //   me.attr('y', d3.event.y);
  //       // });
  //       handleDrag();
  //     }
  //   };
  //   return <rect ref={rectRef} textAnchor="start" x="300" y="50" />;
  // };

  // useEffect(() => {
  //   if (trackRef.current) {
  //     xAxis(select(trackRef.current).attr('font-size', '1em'));
  //     selectAll('text')
  //       .attr('y', '0')
  //       .attr('x', '3')
  //       .attr('dy', '1em')
  //       .style('text-anchor', 'start');
  //   }
  // });

  useEffect(() => {
    const x = scaleBand()
      .domain(range(filteredData.length))
      .range([0, trackWidth]);

    const y = scaleLinear()
      .domain([0, max(filteredData)])
      .range([1, height]);

    const bar = select(trackRef.current)
      .selectAll('g')
      .data(filteredData)
      .join('g')
      .attr(
        'transform',
        (d, i) => `translate(${x(i)}, ${height / 2 - y(d) / 2})`,
      );

    bar
      .append('rect')
      .attr('fill', '#12345678')
      .attr('width', x.bandwidth())
      .attr('height', y);
  }, [filteredData, trackWidth]);

  return (
    <div style={styles.root}>
      {/* <p>{name}</p>
      <button type="button" onClick={() => audio.play()}>
        play
      </button> */}
      {/* <svg height="50" ref={canvasRef}>

      </svg> */}
      <svg style={styles.svg}>
        <svg ref={trackRef}>
          <rect
            style={styles.rect}
            textAnchor="start"
            width={trackWidth}
            height={height}
            rx="5"
            ry="5"
          />
          <text dx="2">{name}</text>
        </svg>
      </svg>
      {/* <audio controls src={audioSource}>
        <track kind="captions" />
      </audio> */}
    </div>
  );
};

AudioTrack.propTypes = {
  // audio: PropTypes.instanceOf(HTMLAudioElement).isRequired,
  audioDuration: PropTypes.number.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.number).isRequired,
  name: PropTypes.string.isRequired,
  timeScale: PropTypes.func.isRequired,
  trackId: PropTypes.string.isRequired,
};

export default AudioTrack;
