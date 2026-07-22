import {
  LayoutDashboard,
  Users,
  LineChart,
  ListTree,
  Trophy,
  GitPullRequestArrow,
  Wallet,
  Coins,
  TrendingUp,
  DollarSign,
  CreditCard,
  Handshake,
  RefreshCcw,
  Settings,
  Tickets,
  Mail,
  Cpu,
  ClipboardList,
  ShieldCheck
} from 'lucide-vue-next'

export const navItems = [
  // 1. Core Overview
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    permission: 'analytics.view',
  },
  // 2. User & Network Administration
  {
    label: 'Clients',
    to: '/clients',
    icon: Users,
    permission: 'client.view',
  },
  {
    label: 'Trading Accounts',
    to: '/trading-accounts',
    icon: LineChart,
    permission: 'trading_account.view',
  },
  {
    label: 'IB Network',
    to: '/ib-tree',
    icon: ListTree,
    permission: ['ib.view', 'ib.view_network'],
  },
  // 3. Fund Management
  {
    label: 'Fund Manager',
    to: '/fm-leaderboard',
    icon: Trophy,
    permission: 'fund_manager.view',
  },
  {
    label: 'FM Requests',
    to: '/fm-request',
    icon: GitPullRequestArrow,
    permission: 'fm_request.view',
  },
  // 4. Finances & Wallets
  {
    label: 'My Wallet',
    to: '/my-wallet',
    icon: Wallet,
    permission: 'wallet.view',
  },
  {
    label: 'Client Wallet',
    to: '/client-wallet',
    icon: Coins,
    permission: 'client_wallet.view',
  },
  {
    label: 'FM Wallet',
    to: '/fm-wallet',
    icon: TrendingUp,
    permission: 'fm_wallet.view',
  },
  {
    label: 'IB Wallet',
    to: '/ib-wallet',
    icon: DollarSign,
    permission: 'ib_wallet.view',
  },
  // 5. Transactions & Cash Flow
  {
    label: 'Payment Methods',
    to: '/payment-methods',
    icon: CreditCard,
    permission: 'payment_methods.view',
  },
  {
    label: 'Payment Requests',
    to: '/payment-requests',
    icon: Handshake,
    permission: 'payment_requests.view',
  },
  {
    label: 'Settlements',
    to: '/settlements',
    icon: RefreshCcw,
    permission: ['settlement.view'],
  },
  {
    label: 'eMails',
    to: '/e-mails',
    icon: Mail,
    permission: ['email.view', 'email.manage'],
  },
  // 6. System & Support
  {
    label: 'Group Config',
    to: '/group-config',
    icon: Settings,
    permission: ['group.group_view', 'group.category_view'],
  },
  {
    label: 'Company Integrations',
    to: '/company-integrations',
    icon: Cpu,
    permission: 'company_integration.view',
  },
  {
    label: 'Audit Logs',
    to: '/audit-logs',
    icon: ClipboardList,
    permission: 'audit.view',
  },
  {
    label: 'Tickets',
    to: '/tickets',
    icon: Tickets,
    permission: ['ticket.view', 'ticket.platform_view'],
  },
  {
    label: 'Access Control',
    to: '/rbac',
    icon: ShieldCheck,
    permission: ['role.manage', 'team_management.view', 'team_management.create', 'team_management.role_manage', 'team_management.role_view'],
  },
]
