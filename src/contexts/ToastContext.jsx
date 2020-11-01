import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const callToast = (type, title, options, details) => {
  const content = (
    <>
      {/* <div>
        icon
      </div> */}
      <div>
        <p>{title}</p>
        {details && <p>{details}</p>}
      </div>
    </>
  );

  toast[type](content, options);
};

const info = (title, options = {}, details = '') =>
  callToast('info', title, options, details);
const success = (title, options = {}, details = '') =>
  callToast('success', title, options, details);
const error = (title, options = {}, details = '') =>
  callToast('error', title, options, details);
const warn = (title, options = {}, details = '') =>
  callToast('warn', title, options, details);

const toastOptions = {
  info,
  success,
  error,
  warn,
};

export const ToastContext = React.createContext(toastOptions);
export const useToastContext = () => useContext(ToastContext);

export const ToastContextProvider = ({ children }) => (
  <ToastContext.Provider value={toastOptions}>
    {children}
    <ToastContainer transition={Slide} />
  </ToastContext.Provider>
);

ToastContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
