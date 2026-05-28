import DefaultLayout from '@/layouts/default.vue'
import AuthLayout from '@/layouts/auth.vue'

const routes = [
    {
        path: '',
        component: AuthLayout,
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('@/pages/auth/login.vue'),
            },
        ]
    },
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                component: () => import('@/pages/dashboard/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Dashboard',
                    description: 'Overview of your trading performance and account status.',
                }
            },
            {
                path: '/clients',
                name: 'clients',
                component: () => import('@/pages/clients/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Clients',
                    description: 'View and manage platform clients.',
                }
            },
            {
                path: '/trading-accounts',
                name: 'trading-accounts',
                component: () => import('@/pages/trading-accounts/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Trading Accounts',
                    description: 'Manage your trading accounts and view performance metrics.',
                }
            },
            {
                path: '/account/trade/:id',
                name: 'client-accounts',
                component: () => import('@/pages/trading-accounts/trades.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Account Trades',
                    description: 'Manage your client accounts and view Trade metrics.',
                    showBackButton: true,
                }
            },
            {
                path: '/account/transactions/:id',
                name: 'client-transactions',
                component: () => import('@/pages/trading-accounts/transactions.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Account Transactions',
                    description: 'View and manage transactions for a specific account.',
                    showBackButton: true,
                }
            },
            {
                path: '/client-wallet',
                name: 'client-wallet',
                component: () => import('@/pages/client-wallet/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Client Wallet',
                    description: 'View and manage your client wallet.',
                }
            },
            {
                path: '/my-wallet',
                name: 'my-wallet',
                component: () => import('@/pages/my-wallet/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'My Wallet',
                    description: 'View and manage your wallet details.',
                }
            },
            {
                path: '/fm-wallet',
                name: 'fm-wallet',
                component: () => import('@/pages/fm-wallet/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'FM Wallet',
                    description: 'View and manage fund manager wallet ledger.',
                }
            },
            {
                path: '/ib-wallet',
                name: 'ib-wallet',
                component: () => import('@/pages/ib-wallet/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'IB Wallet',
                    description: 'View and manage IB wallet ledger.',
                }
            },
            {
                path: '/fm-leaderboard',
                name: 'fm-leaderboard',
                component: () => import('@/pages/fm-leaderboard/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'FM Leaderboard',
                    description: 'See how you rank against other traders in the FM Leaderboard.',
                }
            },
            {
                path: '/fm/settlement-preview/:id',
                name: 'fm-settlement-preview',
                component: () => import('@/pages/fm-leaderboard/fmSettlement.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'FM Settlement Preview',
                    description: 'Preview settlement details for a Fund Manager.',
                    showBackButton: true,
                }
            },
            {
                path: '/fm-request',
                name: 'fm-request',
                component: () => import('@/pages/fm-request/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'FM Requests',
                    description: 'Manage and view Fund Manager requests.',
                }
            },
            {
                path: '/settlements',
                name: 'settlements',
                component: () => import('@/pages/settlements/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Settlements',
                    description: 'Manage and view settlement requests.',
                }
            },
            {
                path: '/settlement/trade/:id',
                name: 'settlement-trades',
                component: () => import('@/pages/settlements/trades.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Settlement Trades',
                    description: 'View trades for a specific settlement.',
                    showBackButton: true,
                }
            },
            {
                path: '/ib-tree',
                name: 'ib-tree',
                component: () => import('@/pages/ib-tree/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'IB Hierarchy',
                    description: 'View and manage IB hierarchy and structure.',
                }
            },
            {
                path: '/tickets',
                name: 'tickets',
                component: () => import('@/pages/tickets/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Support Tickets',
                    description: 'Raise a ticket to connect with the developer team.',
                }
            },
            {
                path: '/ticket/:id',
                name: 'ticket-details',
                component: () => import('@/pages/tickets/ticketDetails.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Ticket Details',
                    description: 'View details of the support ticket.',
                    showBackButton: true,
                }
            },
            {
                path: '/platform-tickets',
                name: 'platform-tickets',
                component: () => import('@/pages/platformTickets/index.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Support Tickets',
                    description: 'Raise a ticket to connect with the developer team.',
                }
            },
            {
                path: '/platform-tickets/:id',
                name: 'platform-tickets-details',
                component: () => import('@/pages/platformTickets/ticketDetails.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Ticket Details',
                    description: 'View details of the support ticket.',
                    showBackButton: true,
                }
            }
        ]
    }
]

export default routes
