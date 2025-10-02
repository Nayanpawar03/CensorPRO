import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"


function App() {
  return (
    <>
      <Routes>
        <Route index element={<Home />} />
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='admin' element={<AdminDashboard />} />
        {/* Support backend redirect using capitalized /Dashboard */}
        <Route path='Dashboard' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </>
  )
}

export default App
