export type UserLocaleWriter = {
  updateMany: (args: {
    where: { email: string };
    data: { locale: string };
  }) => Promise<unknown>;
};

/** Persists the locale chosen on login. Empty email is a no-op (failed/missing identity). */
export async function persistUserLocaleByEmail(
  email: string,
  locale: string,
  users: UserLocaleWriter,
) {
  if (!email) return;
  await users.updateMany({
    where: { email },
    data: { locale },
  });
}
