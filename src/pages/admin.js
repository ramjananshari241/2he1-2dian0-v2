import React from 'react'
import dynamic from 'next/dynamic'

const AdminComponent = dynamic(
  () => import('../components/AdminSystem/AdminDashboard'),
  { ssr: false }
)

const AdminPage = () => {
  return (
    <div id="admin-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'white', overflow: 'auto' }}>
      <AdminComponent />
    </div>
  )
}

export default AdminPage