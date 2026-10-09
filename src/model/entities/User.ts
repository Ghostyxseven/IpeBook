export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  /** Conta originada no Google que ainda precisa definir os dados do IpêBook. */
  needsRegistration?: boolean;
};
