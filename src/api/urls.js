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
    accountTrades: '/accounts/trades',
    transactions: '/accounts/transactions',
  },
  clientList: {
    list: '/client-list',
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
  },
  fm: {
    list: '/fund_managers',
    create: '/fund_managers/create',
    edit: '/fund_managers/edit',
    requestList: '/fm/requests',
    acceptRequest: '/fm/requests/approve',
    rejectRequest: '/fm/requests/reject',
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


}

export default urls
