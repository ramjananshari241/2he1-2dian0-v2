import React from 'react'
import dynamic from 'next/dynamic'

// ⚠️ 这里的路径必须和第二步里的文件夹名完全一致！
// 如果你第二步改成了 AdminSystem，这里就必须是 AdminSystem
const AdminComponent = dynamic(
  () => import('../components/AdminSystem/AdminDashboard'),
  { ssr: false }
)

const AdminPage = () => {
  return (
    <div suppressHydrationWarning>
      <AdminComponent />
    </div>
  )
}

export default AdminPage