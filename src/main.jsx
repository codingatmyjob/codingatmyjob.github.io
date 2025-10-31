import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../style.css'

const el = document.getElementById('react-root') || (function(){
  const h = document.createElement('div');
  h.id = 'react-root';
  document.querySelector('header')?.appendChild(h);
  return h;
})()

createRoot(el).render(<App />)
