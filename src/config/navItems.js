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
  ShieldCheck,
  Layers,
  Target,
  FolderOpen,
  Bell,
  Tag,
  BookmarkCheck,
  Award,
} from "lucide-vue-next";

export const navClusters = [
  // 1. Core Overview
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    permission: "analytics.view",
  },

  // 2. CRM & Network
  {
    id: "crm",
    label: "CRM & Network",
    icon: Users,
    children: [
      {
        label: "Lead Management",
        to: "/lead-management",
        icon: Target,
        permission: "lead_management.view",
      },
      {
        label: "Clients",
        to: "/clients",
        icon: Users,
        permission: "client.view",
      },
      {
        label: "Trading Accounts",
        to: "/trading-accounts",
        icon: LineChart,
        permission: "trading_account.view",
      },
      {
        label: "IB Network",
        to: "/ib-tree",
        icon: ListTree,
        permission: ["ib.view", "ib.view_network"],
      },
    ],
  },

  // 3. Fund Management
  {
    id: "fund_management",
    label: "Fund Management",
    icon: Trophy,
    children: [
      {
        label: "Fund Manager",
        to: "/fm-leaderboard",
        icon: Trophy,
        permission: "fund_manager.view",
      },
      {
        label: "FM Requests",
        to: "/fm-request",
        icon: GitPullRequestArrow,
        permission: "fm_request.view",
      },
    ],
  },

  // 4. Finances & Wallets
  {
    id: "wallets",
    label: "Wallets",
    icon: Wallet,
    children: [
      {
        label: "My Wallet",
        to: "/my-wallet",
        icon: Wallet,
        permission: "wallet.view",
      },
      {
        label: "Client Wallet",
        to: "/client-wallet",
        icon: Coins,
        permission: "client_wallet.view",
      },
      {
        label: "FM Wallet",
        to: "/fm-wallet",
        icon: TrendingUp,
        permission: "fm_wallet.view",
      },
      {
        label: "IB Wallet",
        to: "/ib-wallet",
        icon: DollarSign,
        permission: "ib_wallet.view",
      },
    ],
  },

  // 5. Finance & Payments
  {
    id: "finance",
    label: "Finance & Cash Flow",
    icon: CreditCard,
    children: [
      {
        label: "Payment Methods",
        to: "/payment-methods",
        icon: CreditCard,
        permission: "payment_methods.view",
      },
      {
        label: "Payment Requests",
        to: "/payment-requests",
        icon: Handshake,
        permission: "payment_requests.view",
      },
      {
        label: "Settlements",
        to: "/settlements",
        icon: RefreshCcw,
        permission: ["settlement.view"],
      },
    ],
  },

  // 6. Communications & Media
  {
    id: "communications",
    label: "Communications",
    icon: Mail,
    children: [
      {
        label: "eMails",
        to: "/e-mails",
        icon: Mail,
        permission: ["email.view", "email.manage"],
      },
      {
        label: "Media Library",
        to: "/media",
        icon: FolderOpen,
        permission: ["media.view"],
      },
      {
        label: "Telegram",
        to: "/telegram",
        icon: ClipboardList,
        permission: [
          "telegram.view",
          "telegram.create",
          "telegram.update",
          "telegram.delete",
          "telegram.configure_view",
          "telegram.configure_update",
        ],
      },
    ],
  },

  // 7. Platform & Trading Config
  {
    id: "platform",
    label: "Platform & Trading",
    icon: Cpu,
    children: [
      {
        label: "Group Config",
        to: "/group-config",
        icon: Settings,
        permission: ["group.group_view", "group.category_view"],
      },
      {
        label: "Watchlist",
        to: "/watchlist",
        icon: BookmarkCheck,
        permission: [
          "watchlist.settings_view",
          "watchlist.settings_update",
          "watchlist.symbols_view",
          "watchlist.symbols_create",
          "watchlist.symbols_update",
          "watchlist.symbols_delete",
          "watchlist.symbols_import",
        ],
      },
      {
        label: "Company Integrations",
        to: "/company-integrations",
        icon: Cpu,
        permission: "company_integration.view",
      },
      {
        label: "Audit Logs",
        to: "/audit-logs",
        icon: ClipboardList,
        permission: "audit.view",
      },
    ],
  },

  // 8. Support & Engagement
  {
    id: "support",
    label: "Support & Loyalty",
    icon: Tickets,
    children: [
      {
        label: "Tickets",
        to: "/tickets",
        icon: Tickets,
        permission: ["ticket.view", "ticket.platform_view"],
      },
      {
        label: "Notifications",
        to: "/notifications",
        icon: Bell,
        permission: ["notifications.view", "notifications.create"],
      },
      {
        label: "Tag Management",
        to: "/tags",
        icon: Tag,
        permission: ["tags.view"],
      },
      {
        label: "Loyalty Program",
        to: "/loyalty-program",
        icon: Award,
        permission: ["loyalty.view"],
      },
    ],
  },

  // 9. Administration & Security
  {
    id: "administration",
    label: "Administration",
    icon: ShieldCheck,
    children: [
      {
        label: "Access Control",
        to: "/rbac",
        icon: ShieldCheck,
        permission: [
          "role.manage",
          "team_management.view",
          "team_management.create",
          "team_management.role_manage",
          "team_management.role_view",
        ],
      },
      {
        label: "RBAC Modules",
        to: "/rbac-modules",
        icon: Layers,
        permission: ["xtention_dev.view"],
      },
      {
        label: "System Settings",
        to: "/settings",
        icon: Settings,
        permission: ["system_setting.view"],
      },
    ],
  },
];

// Flat list for router checks, permission store & backward compatibility
export const navItems = navClusters.flatMap((cluster) =>
  cluster.children ? cluster.children : [cluster]
);
