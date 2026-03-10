import {db} from '../config/db'
import {roleTemplates} from './schema'

/**
 * 数据库种子数据
 * 初始化默认的权限模板
 */
async function seed() {
  console.log('🌱 Seeding database...')

  // 检查是否已存在系统模板
  const existing = await db.query.roleTemplates.findMany({
    where: (table, {eq}) => eq(table.isSystem, true),
  })

  if (existing.length > 0) {
    console.log('✅ System roles already exist, skipping seed')
    return
  }

  // 创建默认权限模板
  const defaultRoles = [
    {
      id: crypto.randomUUID(),
      name: '超级管理员',
      description: '拥有系统的所有权限',
      permissions: ['*'],
      isSystem: true,
    },
    {
      id: crypto.randomUUID(),
      name: '用户管理员',
      description: '管理用户和权限',
      permissions: [
        'user:read',
        'user:write',
        'user:write:status',
        'user:read:detail',
        'role:read',
        'audit:read',
      ],
      isSystem: true,
    },
    {
      id: crypto.randomUUID(),
      name: '审计员',
      description: '查看审计日志和用户',
      permissions: ['audit:read', 'user:read', 'user:read:detail'],
      isSystem: true,
    },
    {
      id: crypto.randomUUID(),
      name: '普通用户',
      description: '基本权限，只能查看和修改自己的资料',
      permissions: ['profile:read', 'profile:write'],
      isSystem: true,
    },
  ]

  for (const role of defaultRoles) {
    await db.insert(roleTemplates).values(role)
    console.log(`  Created role: ${role.name}`)
  }

  console.log('✅ Seed completed')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
