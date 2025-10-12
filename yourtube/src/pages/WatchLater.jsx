import React, { Suspense } from 'react'
import WatchLetterContent from '../componects/UI/WatchLaterContent';

const WatchLater = () => {
    return (
        <div>
            <div>
                <h1>Watch Later</h1>
                <Suspense fallback={<div>Loading</div>}>
                    <WatchLetterContent />
                </Suspense>
            </div>
        </div>
    )
}

export default WatchLater
