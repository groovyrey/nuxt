export const useAuth = () => {
  const user = useState<any>('user', () => null);
  const isLoading = useState('auth_loading', () => true);

  const fetchUser = async () => {
    isLoading.value = true;
    try {
      const data = await $fetch('/api/auth/me', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
      });
      user.value = data?.user || null;
    } catch (e) {
      console.error('Failed to fetch user:', e);
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
