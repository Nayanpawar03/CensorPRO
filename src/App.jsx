import { useState } from 'react'
import { Routes, Route } from "react-router-dom"
import Home from "../src/pages/Home"
import Register from "../src/pages/Register"
import Login from "../src/pages/Login"
import Dashboard from "../src/pages/Dashboard"


function App() {
  return (
    <>
      <Routes>
        <Route index element={<Home />} />
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='dashboard' element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
