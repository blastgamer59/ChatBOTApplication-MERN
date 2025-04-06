import React from 'react'
import "./styles.css";
import Sidebar from './Sidebar/Sidebar';
import Chat from './Chat/Chat';

const Home = () => {
  return (
    <div>
      <Sidebar />
      <Chat />
    </div>
  )
}

export default Home;
