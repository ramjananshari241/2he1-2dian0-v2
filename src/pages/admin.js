import React from 'react'
import dynamic from 'next/dynamic'

// ⚠️ 重点检查这一行：
// 1. 它是 ../components (两个点)
// 2. 它是 /AdminSystem (大写 A 和 S，必须和文件夹名一致)
// 3. 它是 /AdminDashboard (文件名)
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