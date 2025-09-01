import axios from "axios"

export const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: { "Content-Type": "application/json" },
})

export type User = {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  company: { name: string }
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
  }
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users")
  return data
}

export async function fetchUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`)
  return data
}

export async function createUser(payload: Partial<User>): Promise<User> {
  const { data } = await api.post<User>("/users", payload)
  return data
}

export async function updateUser(id: number, payload: Partial<User>): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}
