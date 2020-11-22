import React from 'react';
import PropTypes from 'prop-types';

const ErrorFallback = ({ error }) => (
  <>
    <h1>Something went wrong.</h1>
    <div>{error.message}</div>
  </>
);
ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }).isRequired,
};

export default ErrorFallback;
