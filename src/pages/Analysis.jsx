import React from 'react';
import { AudioAnalyser } from '../components';
import PageLayout from './PageLayout';

const Analysis = () => {
  return (
    <PageLayout title="Audio Analysis">
      <AudioAnalyser />
    </PageLayout>
  );
};
export default Analysis;
