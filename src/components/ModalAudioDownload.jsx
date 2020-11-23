import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { useAppAudioContext } from '../contexts/AppAudioContext';

const ModalAudioDownload = ({ isOpen, close }) => {
  const [fileName, setFileName] = useState();
  const { downloadAudio } = useAppAudioContext();

  const handleDownload = async () => {
    downloadAudio(fileName);
  };
  const overlayStyles = {
    zIndex: 700,
  };

  return (
    <Modal
      className="modal"
      isOpen={isOpen}
      onRequestClose={close}
      style={{
        overlay: overlayStyles,
      }}
    >
      <div className="modal-header">
        <h3>Download</h3>
      </div>
      <div className="modal-content">
        <p>
          The audio will be downloaded as a <code>.wav</code> file.
        </p>
        <div className="input-area">
          <input
            type="text"
            name="downloadName"
            placeholder="audio"
            onChange={(event) => setFileName(event.target.value)}
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="downloadName">File Name</label>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={close} type="button">
          Cancel
        </button>
        <button onClick={handleDownload} type="button" className="primary">
          Download
        </button>
      </div>
    </Modal>
  );
};
ModalAudioDownload.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default ModalAudioDownload;
