export const useAuth = () => {
  const user = useState<any>('user', () => null);
  const isLoading = useState('auth_loading', () => true);

  const fetchUser = async () => {
    isLoading.value = true;
    try {
      const { data } = await useFetch('/api/auth/me');
      user.value = (data.value as any)?.user;
    } catch (e) {
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    navigateTo('/login');
  };

  return {
    user,
    isLoading,
    fetchUser,
    logout
  };
};
