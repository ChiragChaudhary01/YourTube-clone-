import { useState } from 'react'
import './index.css'
import Home from './pages/index.jsx'
import { Route, Routes } from 'react-router'
import Layout from './pages/Layout.jsx'
import WatchVideo from './pages/watch/[id]/index.jsx'
import History from './pages/History.jsx'
import Liked from './pages/Liked.jsx'
import WatchLater from './pages/WatchLater.jsx'
import ChannelPage from './pages/channel/[id]/index.jsx'
import { ToastContainer } from 'react-toastify';
import Search from './pages/Search.jsx'
import ProfileDownloads from './pages/ProfileDownloads.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path='watch/:id' element={<WatchVideo />}></Route>
          <Route path='history' element={<History />} />
          <Route path='liked' element={<Liked />} />
          <Route path='watch-later' element={<WatchLater />} />
          <Route path='downloads' element={<ProfileDownloads />} />
          <Route path='channel/:id' element={<ChannelPage />}></Route>
          <Route path='search' element={<Search />}></Route>
        </Route >
      </Routes >
      <ToastContainer />
    </div>
  )
}

export default App
