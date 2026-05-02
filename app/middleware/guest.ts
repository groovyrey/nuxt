export default defineNuxtRouteMiddleware(async () => {
  const { user, isLoading, fetchUser } = useAuth();

  if (!user.value && isLoading.value) {
    await fetchUser();
  }

  if (user.value) {
    return navigateTo('/');
  }
});
