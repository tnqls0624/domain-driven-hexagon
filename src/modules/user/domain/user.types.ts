import { Address } from './value-objects/address.value-object';
import { UserRoles } from '@prisma/client';

// All properties that a User has
export interface UserProps {
  role: UserRoles;
  email: string;
  address: Address;
}

// Properties that are needed for a user creation
export interface CreateUserProps {
  email: string;
  address: Address;
}

// Properties used for updating a user address
export interface UpdateUserAddressProps {
  country?: string;
  postalCode?: string;
  street?: string;
}
