import React from 'react';
import { AudioAnalyser } from '../components';
import PageLayout from './PageLayout';

const Analysis = () => {
  return (
    <PageLayout title="Audio Analysis" style={{ padding: '2rem' }}>
      <div style={{ position: 'relative' }}>
        <AudioAnalyser />
      </div>
    </PageLayout>
  );
};
export default Analysis;
