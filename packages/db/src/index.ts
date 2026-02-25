/**
 * @beeve/db - 公共 API
 *
 * 统一导出数据库客户端和 schema。
 * 使用 getDb() 工厂函数获取数据库实例（延迟初始化）。
 * 也可通过 '@beeve/db/schema' 单独导入 schema，不触发 DB 连接。
 */

export {getDb} from './client'
export * from './schema'
