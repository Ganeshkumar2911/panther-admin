import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useNotificationsStore = defineStore("notifications", () => {
  const myNotifications = ref([]);
  const adminNotifications = ref([]);
  const myLoading = ref(false);
  const adminLoading = ref(false);
  const createLoading = ref(false);
  const isMyFetched = ref(false);
  const isAdminFetched = ref(false);

  const snackbar = useSnackbarStore();

  // Computed unread count for current user
  const unreadCount = computed(() => {
    return myNotifications.value.filter((n) => !n.is_read).length;
  });

  // ─── Fetch Logged-in User's Notifications ─────────────────────────
  const fetchMyNotifications = (force = false) => {
    if (myLoading.value) return;
    if (isMyFetched.value && !force) return;

    myLoading.value = true;

    const successHandler = (res) => {
      // res can be an array directly or res.data
      const list = Array.isArray(res) ? res : res?.data || [];
      myNotifications.value = list;
      myLoading.value = false;
      isMyFetched.value = true;
    };

    const failureHandler = (err) => {
      myLoading.value = false;
      // Fail gracefully or show notification
    };

    apiRequest(urls.KEYS.GET, urls.notifications.myNotifications, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch Admin Historical Notification List ──────────────────────
  const fetchAdminNotifications = (force = false) => {
    if (adminLoading.value) return;
    if (isAdminFetched.value && !force) return;

    adminLoading.value = true;

    const successHandler = (res) => {
      const list = Array.isArray(res) ? res : res?.data || [];
      adminNotifications.value = list;
      adminLoading.value = false;
      isAdminFetched.value = true;
    };

    const failureHandler = (err) => {
      adminLoading.value = false;
      snackbar.show(err?.message || "Failed to fetch system notifications.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.notifications.adminList, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Mark Notification as Read ────────────────────────────────────
  const markAsRead = (notificationId) => {
    // Optimistic update
    const item = myNotifications.value.find((n) => n.id === notificationId);
    if (item && !item.is_read) {
      item.is_read = true;
      item.read_at = new Date().toISOString();
    }

    const successHandler = () => {
      // Successfully marked as read on server
    };

    const failureHandler = () => {
      // Revert if API fails
      if (item) {
        item.is_read = false;
        item.read_at = null;
      }
    };

    apiRequest(urls.KEYS.PUT, `${urls.notifications.markRead}/${notificationId}`, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Mark All Unread Notifications as Read ─────────────────────────
  const markAllAsRead = () => {
    const unreadItems = myNotifications.value.filter((n) => !n.is_read);
    unreadItems.forEach((n) => markAsRead(n.id));
  };

  // ─── Create & Dispatch Notification (Admin) ─────────────────────────
  const createNotification = (payload, onDone) => {
    createLoading.value = true;

    const successHandler = (res) => {
      createLoading.value = false;
      snackbar.show(res?.msg || "Notification created & dispatched successfully.", "success");
      fetchAdminNotifications(true);
      fetchMyNotifications(true);
      if (onDone) onDone();
    };

    const failureHandler = (err) => {
      createLoading.value = false;
      snackbar.show(err?.message || "Failed to create notification.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.notifications.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const sendLoadingId = ref(null);

  // ─── Trigger / Activate Notification (Admin PUT /notifications/send/<id>) ──
  const sendNotification = (id, onDone) => {
    sendLoadingId.value = id;

    const successHandler = (res) => {
      sendLoadingId.value = null;
      snackbar.show(res?.msg || "Notification activated & sent successfully.", "success");
      const found = adminNotifications.value.find((n) => n.id === id);
      if (found) {
        found.is_active = true;
      }
      fetchAdminNotifications(true);
      fetchMyNotifications(true);
      if (onDone) onDone();
    };

    const failureHandler = (err) => {
      sendLoadingId.value = null;
      snackbar.show(err?.message || "Failed to send notification.", "error");
    };

    apiRequest(urls.KEYS.PUT, `${urls.notifications.send}/${id}`, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    myNotifications,
    adminNotifications,
    myLoading,
    adminLoading,
    createLoading,
    sendLoadingId,
    unreadCount,
    fetchMyNotifications,
    fetchAdminNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    sendNotification,
  };
});
