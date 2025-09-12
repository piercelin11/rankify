import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('開始插入測試用戶...')

  const users = []
  
  for (let i = 1; i <= 20; i++) {
    const user = {
      name: `測試用戶 ${i}`,
      username: `testuser${i}`,
      email: `testuser${i}@example.com`,
      role: 'USER'
    }
    users.push(user)
  }

  try {
    const createdUsers = await prisma.user.createMany({
      data: users,
      skipDuplicates: true
    })
    
    console.log(`成功插入 ${createdUsers.count} 個測試用戶`)
    
    // 顯示所有用戶
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\n目前資料庫中的所有用戶：')
    console.table(allUsers)
    
  } catch (error) {
    console.error('插入用戶時發生錯誤：', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()