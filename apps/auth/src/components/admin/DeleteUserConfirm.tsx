/**
 * 删除用户确认弹窗
 * 使用 alertdialog 角色，destructive 样式
 */
import type {Component} from 'solid-js'
import {Dialog, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {UserDialogProps} from './types'

export const DeleteUserConfirm: Component<UserDialogProps> = (props) => {
  const handleOk = async () => {
    const {error} = await authClient.admin.removeUser({
      userId: props.user.id,
    })

    if (error) {
      toast.error(`删除失败: ${error.message}`)
      throw error
    }

    toast.success('用户已删除')
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="删除用户"
      description={`确定要永久删除用户「${props.user.name || props.user.email}」吗？此操作不可撤销，该用户的所有数据将被永久删除。`}
      role="alertdialog"
      okType="destructive"
      okText="确认删除"
      onOk={handleOk}
      maskClosable={false}
      width="md"
    />
  )
}
