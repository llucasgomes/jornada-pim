export type usuario = {
  id: string
  name: string
  cpf: string
  email: string
  password: string
  role: UserRole
  company_id: string
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}
