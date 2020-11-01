import React from 'react';
import { Timeline, Toolbar } from '../components';
import PageLayout from './PageLayout';

const Record = () => {
  return (
    <PageLayout title="Audio Recorder">
      <Toolbar />
      <Timeline />
    </PageLayout>
  );
};
export default Record;
