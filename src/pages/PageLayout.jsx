import React from 'react';
import PropTypes from 'prop-types';

const PageLayout = ({ title, children }) => {
  return (
    <div className="App">
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          made with{' '}
          <span role="img" aria-label="love">
            ❤️
          </span>{' '}
          by <a href="https://twitter.com/collinss97">@collinss97</a>
        </p>
      </footer>
    </div>
  );
};

PageLayout.defaultProps = {
  title: 'Audio App',
};
PageLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default PageLayout;
