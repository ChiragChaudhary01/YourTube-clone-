import React, { Suspense } from 'react'
import HistoryContent from '../componects/UI/HistoryContent';

const History = () => {
    return (
        <div>
            <div>
                <h1>Watch History</h1>
                <Suspense fallback={<div>Loading</div>}>
                    <HistoryContent />
                </Suspense>
            </div>
        </div>
    )
}

export default History
