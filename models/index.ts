/**
 * Registro central de modelos Mongoose.
 * Importar este archivo al inicio para asegurar que todos los modelos
 * estén registrados antes de cualquier populate() u operación de BD.
 * Orden: Organization y OrganizationRole antes de User (por populate).
 */
import "./Organization";
import "./OrganizationRole";
import "./User";
import "./Log";

export { User } from "./User";
export { Organization } from "./Organization";
export {
  OrganizationRole,
  PERMISSIONS,
  type Permission,
  type IOrganizationRole
} from "./OrganizationRole";
export type { IUser, UserType } from "./User";
export type { IOrganization } from "./Organization";
export { Log } from "./Log";
export type { ILog } from "./Log";
