/**
 * Parallaxa API Client
 * Connects React Native frontend to Parallaxa backend
 */

const BASE_URL = process.env.EXPO_PUBLIC_PARALLAXA_API_URL || 'http://localhost:3001/api/v1'

interface RequestOptions extends RequestInit {
  body?: any
}

let authToken: string | null = null

/**
 * Set authentication token
 */
export function setAuthToken(token: string | null) {
  authToken = token
}

/**
 * Get current auth token
 */
export function getAuthToken() {
  return authToken
}

/**
 * Make API request with error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error((data as any).error || 'API request failed')
    ;(error as any).status = response.status
    throw error
  }

  return data as T
}

// ============= AUTH ENDPOINTS =============

export interface RegisterRequest {
  email: string
  handle: string
  displayName: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  })
  if (response.token) {
    setAuthToken(response.token)
  }
  return response
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  })
  if (response.token) {
    setAuthToken(response.token)
  }
  return response
}

// ============= TYPES =============

export interface User {
  id: string
  email: string
  handle: string
  displayName: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  followerCount?: number
  followingCount?: number
  postsCount?: number
}

export interface Post {
  id: string
  authorId: string
  author: User
  content: string
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  isLikedByMe: boolean
}

export interface Comment {
  id: string
  postId: string
  author: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface FeedResponse {
  posts: Post[]
  limit: number
  offset: number
}

export interface SearchResponse<T> {
  results: T[]
  limit: number
  offset: number
}

// ============= USER ENDPOINTS =============

export async function getUserProfile(handle: string): Promise<User> {
  return request<User>(`/users/${handle}`)
}

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  isPrivate?: boolean
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  return request<User>('/users/me', {
    method: 'PATCH',
    body: data,
  })
}

export async function followUser(userId: string): Promise<{ success: boolean }> {
  return request(`/users/${userId}/follow`, {
    method: 'POST',
  })
}

export async function unfollowUser(userId: string): Promise<{ success: boolean }> {
  return request(`/users/${userId}/follow`, {
    method: 'DELETE',
  })
}

// ============= POST ENDPOINTS =============

export async function getFeed(limit = 20, offset = 0): Promise<FeedResponse> {
  return request<FeedResponse>(`/posts/feed?limit=${limit}&offset=${offset}`)
}

export interface CreatePostRequest {
  content: string
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
  return request<Post>('/posts', {
    method: 'POST',
    body: data,
  })
}

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  return request(`/posts/${postId}`, {
    method: 'DELETE',
  })
}

export async function likePost(postId: string): Promise<{ success: boolean }> {
  return request(`/posts/${postId}/like`, {
    method: 'POST',
  })
}

export async function unlikePost(postId: string): Promise<{ success: boolean }> {
  return request(`/posts/${postId}/like`, {
    method: 'DELETE',
  })
}

export interface AddCommentRequest {
  content: string
}

export async function addComment(
  postId: string,
  data: AddCommentRequest,
): Promise<Comment> {
  return request<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: data,
  })
}

// ============= SEARCH ENDPOINTS =============

export async function searchUsers(
  query: string,
  limit = 20,
  offset = 0,
): Promise<SearchResponse<User>> {
  return request<SearchResponse<User>>(
    `/search/users?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
  )
}

export async function searchPosts(
  query: string,
  limit = 20,
  offset = 0,
): Promise<SearchResponse<Post>> {
  return request<SearchResponse<Post>>(
    `/search/posts?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
  )
}

export async function getTrendingPosts(
  limit = 20,
  offset = 0,
): Promise<SearchResponse<Post>> {
  return request<SearchResponse<Post>>(`/search/trending?limit=${limit}&offset=${offset}`)
}
