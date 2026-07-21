import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import authToken from '@/common/authToken'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const token = authToken.getToken().accessToken
  const isAuthenticated = Boolean(token)

  const publicRoutes = ['login', 'register', 'dev-login']
  const isPublicRoute = publicRoutes.includes(to.name)

  // 🔹 Redirect "/" → dashboard (if logged in) or login
  if (to.path === '/') {
    return isAuthenticated
      ? { path: '/dashboard' }
      : { path: '/login' }
  }

  // 🔹 If logged in → block login/register
  if (isPublicRoute && isAuthenticated) {
    return { path: '/dashboard' }
  }

  // 🔹 If not logged in → block protected routes
  if (!isPublicRoute && !isAuthenticated) {
    return { path: '/login' }
  }

  return true
})

export default router