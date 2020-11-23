import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PageLayout = ({ title, children, ...props }) => {
  return (
    <div className="App">
      <header>
        <h1 className="title">{title}</h1>
        <nav>
          <Link to="/analysis">Analyse</Link>
          <Link to="/record">Record</Link>
        </nav>
      </header>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <main {...props}>{children}</main>
      <footer>
        <p>
          made with{' '}
          <span role="img" aria-label="love">
            ❤️
          </span>{' '}
          by{' '}
          <a href="https://www.linkedin.com/in/spencer-collins/">
            Spencer Collins
          </a>
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
