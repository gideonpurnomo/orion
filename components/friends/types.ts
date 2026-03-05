export interface FriendUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

export interface FriendRecord {
  id: string
  createdAt: string
  user: FriendUser
}

export interface FriendRequest {
  id: string
  createdAt: string
  message?: string | null
  sender?: FriendUser
  receiver?: FriendUser
}

export interface InviteCode {
  code: string
  uses: number
  maxUses: number | null
}
