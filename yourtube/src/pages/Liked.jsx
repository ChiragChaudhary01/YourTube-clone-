import React, { Suspense } from 'react'
import LikedContent from '../componects/UI/LikedContent'

const Liked = () => {
    return (
        <div>
            <div>
                <h1>Liked Videos</h1>
                <Suspense fallback={<div>Loading</div>}>
                    <LikedContent />
                </Suspense>
            </div>
        </div>
    )
}

export default Liked
