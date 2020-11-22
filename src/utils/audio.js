// Source: https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/
// Also:   https://github.com/jackedgson/crunker/blob/master/src/crunker.js

// Convert AudioBuffer to a Blob using WAVE representation

const interleave = (input) => {
  const buffer = input.getChannelData(0);
  const length = buffer.length * 2;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[(index += 1)] = buffer[inputIndex];
    result[(index += 1)] = buffer[inputIndex];
    inputIndex += 1;
  }
  return result;
};

const writeString = (dataview, offset, header) => {
  for (let i = 0; i < header.length; i += 1) {
    dataview.setUint8(offset + i, header.charCodeAt(i));
  }
};

const floatTo16BitPCM = (dataview, buffer, offset) => {
  for (
    let i = 0, byteOffset = offset;
    i < buffer.length;
    i += 1, byteOffset += 2
  ) {
    const tmp = Math.max(-1, Math.min(1, buffer[i]));
    dataview.setInt16(byteOffset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
  }
  return dataview;
};

const writeHeaders = (buffer, sampleRate = 44100) => {
  const arrayBuffer = new ArrayBuffer(44 + buffer.length * 2);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + buffer.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, buffer.length * 2, true);

  return floatTo16BitPCM(view, buffer, 44);
};

const renderURL = (blob) => {
  return (window.URL || window.webkitURL).createObjectURL(blob);
};

const renderAudioElement = (blob, type) => {
  const audio = document.createElement('audio');
  audio.controls = 'controls';
  audio.type = type;
  audio.src = renderURL(blob);
  return audio;
};

// eslint-disable-next-line import/prefer-default-export
export const bufferToWave = (buffer, audioType, sampleRate) => {
  const type = audioType || 'audio/wav; codecs=0';
  const recorded = interleave(buffer);
  const dataview = writeHeaders(recorded, sampleRate);
  const audioBlob = new Blob([dataview], { type });

  return {
    blob: audioBlob,
    url: renderURL(audioBlob),
    element: renderAudioElement(audioBlob, type),
  };
};
