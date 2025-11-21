import React from 'react';
import { Timer } from './Timer';
import { StoicQuoteBlock } from './StoicQuoteBlock';
import { Stats } from './Stats';
import { ContributionGraph } from './ContributionGraph';
import { History } from './History';
import { Session } from '../types';

interface TrackerStandardProps {
  sessions: Session[];
  timerProps: any;
}

export const TrackerStandard: React.FC<TrackerStandardProps> = ({ sessions, timerProps }) => {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
        <Timer 
            {...timerProps}
        />

        <div className="mb-8">
             <StoicQuoteBlock />
        </div>

        <div className="space-y-6 pb-20">
            <div className="grid grid-cols-1 gap-6">
                <Stats sessions={sessions} layoutMode="standard" />
                <ContributionGraph sessions={sessions} />
            </div>
            
            <History sessions={sessions} />
        </div>
    </div>
  );
};