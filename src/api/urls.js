import { Plane, Wallet } from "lucide-vue-next"

const urls = {
  KEYS:{
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    PATCH: 'patch',
    DELETE: 'delete',
  },
  auth: {
    login: '/login',
    profile: '/profile',
  },
  dashboard: {
    list: '/dashboard',
    revenueAnalytics: '/dashboard/revenue-analytics'
  },
  tradingAccounts: {
    list: '/accounts',
    create: '/accounts/create',
    changePassword: '/accounts/change-password',
    accountTrades: '/accounts/trades',
    transactions: '/accounts/transactions',
    deposit: '/accounts/deposit',
    withdraw: '/accounts/withdraw',
    groups: '/account-groups',
  },
  clientList: {
    list: '/client-list',
    changeIB: '/client/change-ib',
  },
  clientLedger: {
    list: '/ledger/clients',
    allClients: '/search/clients',
    allAccounts: '/search/accounts',
  },
  fmLedger: {
    list: '/ledger/fms',
    allFundManagers: '/search/fm',
  },
  ibLedger: {
    list: '/ledger/ib',
    allIbs: '/search/ib',
  },
  adminLedger: {
    list: '/ledger/admin',
  },
  ibTree: {
    list: '/ib-network',
    create: '/ib/create',
    update: '/ib/update',
    delete: '/ib/delete',
    transfer: '/ib-transfer',
    clients: '/ibs/clients/',
  },
  fm: {
    list: '/fund_managers',
    create: '/fund_managers/create',
    edit: '/fund_managers/edit',
    requestList: '/fm/requests',
    acceptRequest: '/fm/requests/approve',
    rejectRequest: '/fm/requests/reject',
    settlementPreview: '/settlement/preview',
    settlementRun: '/settlement/run',
  },
  settlements:{
    list: '/settlements',
    trades: '/settlements/trades'
  },
  tickets: {
    list: '/support/tickets',
    create: '/support/tickets',
    detail: '/support/tickets',
    comment: '/support/tickets/comments',
    attachment: '/support/tickets/attachments',
    updateStatus: '/support/tickets/status',
  },
  platformTickets: {
    list: '/support/tickets/platform',
    create: '/support/tickets',
    detail: '/support/tickets',
    comment: '/support/tickets/comments',
    attachment: '/support/tickets/attachments',
    updateStatus: '/support/tickets/status',
  },
  groupConfig: {
    list: '/mt5/groups',
    add: '/group-config',
    setDefault: '/broker-group-configs/default',
    deconfig: '/group-config/',
    categories: '/account-categories',
    groups: '/mt5/groups',
    create: '/group-config',
  },
  paymentMethods: {
    create: '/payments/payment-methods',
    list: '/payments/payment-methods',
    syncWallets: '/payments/sync-wallets',
    update: '/payments/payment-methods',
  },
  paymentRequests: {
    list: '/payment-requests',
    approve: '/payment-requests/approve/',
    reject: '/payment-requests/reject/'
  },
  emailSettings: {
    details: '/email-settings',
    update: '/email-settings'
  },
  emailTemplates: {
    list: '/email-templates',
    details: '/email-templates',
    create: '/email-templates',
    update: '/email-templates',
    manual: '/emails/manual/send'
  }
}

export default urls
