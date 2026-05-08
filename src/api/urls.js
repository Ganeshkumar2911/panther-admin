import { Plane, Wallet } from "lucide-vue-next"

const urls = {
  KEYS:{
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
  },
  auth: {
    login: '/login',
    profile: '/profile',
  },
  tradingAccounts: {
    list: '/accounts',
    create: '/accounts/create',
    accountTrades: '/accounts/trades'
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
  },


}

export default urls
