<template>
  <div class="floating-panel admin-panel">
    <div class="floating-panel__header">
      <h2 class="floating-panel__title">{{ t("admin.title") }}</h2>
      <button type="button" class="icon-btn" :aria-label="t('common.close')" @click="$emit('close')">
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="floating-panel__body">
      <div v-if="loading" class="panel-state">{{ t("admin.loading") }}</div>
      <div v-else-if="loadError" class="panel-state error">{{ t("admin.errors.loadFailed") }}</div>
      <div v-else-if="!users.length" class="panel-empty-state">{{ t("admin.empty") }}</div>

      <template v-else>
        <ul class="admin-user-list">
          <li v-for="user in users" :key="user.id" class="admin-user-item">
            <div class="admin-user-item__info">
              <span class="admin-user-item__name">
                {{ user.name }}
                <span v-if="isCurrentUser(user)" class="admin-user-item__badge">{{ t("admin.you") }}</span>
              </span>
              <span class="admin-user-item__email">{{ user.email }}</span>
              <span class="admin-user-item__role" :class="{ 'admin-user-item__role--admin': user.role === 'ADMIN' }">
                {{ user.role }}
              </span>
            </div>

            <button
              v-if="!isCurrentUser(user)"
              type="button"
              class="icon-btn admin-user-item__delete"
              :aria-label="t('admin.delete.button')"
              :disabled="deletingId === user.id"
              @click="handleDelete(user)"
            >
              <AppIcon name="trash" :size="16" />
            </button>
          </li>
        </ul>

        <div class="admin-pagination">
          <button
            type="button"
            class="btn btn-secondary admin-pagination__btn"
            :disabled="page <= 0"
            @click="goToPage(page - 1)"
          >
            {{ t("admin.pagination.prev") }}
          </button>
          <span class="admin-pagination__label">
            {{ t("admin.pagination.pageLabel") }} {{ page + 1 }} / {{ Math.max(totalPages, 1) }}
          </span>
          <button
            type="button"
            class="btn btn-secondary admin-pagination__btn"
            :disabled="page >= totalPages - 1"
            @click="goToPage(page + 1)"
          >
            {{ t("admin.pagination.next") }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import AppIcon from "./AppIcon.vue";
import { t } from "../i18n";
import httpClient from "../services/httpClient";
import { pushToast } from "../store/toast";
import { confirm } from "../composables/useConfirm";
import { authState } from "../store/auth";

const PAGE_SIZE = 20;

export default {
  name: "AdminPanel",

  components: { AppIcon },

  emits: ["close"],

  data() {
    return {
      users: [],
      page: 0,
      totalPages: 0,
      loading: false,
      loadError: false,
      deletingId: null,
    };
  },

  mounted() {
    this.fetchUsers(0);
  },

  methods: {
    t,

    isCurrentUser(user) {
      return !!authState.user && user.id === authState.user.id;
    },

    async fetchUsers(page) {
      this.loading = true;
      this.loadError = false;
      try {
        const { data } = await httpClient.get("/api/admin/users", {
          params: { page, size: PAGE_SIZE },
        });
        this.users = data.content || [];
        this.page = data.number ?? page;
        this.totalPages = data.totalPages ?? 0;
      } catch (err) {
        if (err.response?.status === 403) {
          pushToast(t("admin.errors.forbidden"), "error");
        }
        this.loadError = true;
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page < 0 || page > this.totalPages - 1) return;
      this.fetchUsers(page);
    },

    async handleDelete(user) {
      const label = user.name ? `${user.name} (${user.email})` : user.email;
      const confirmed = await confirm({
        title: t("admin.delete.confirmTitle"),
        message: `${t("admin.delete.confirmMessage")} ${label}`,
        isDangerous: true,
      });
      if (!confirmed) return;

      this.deletingId = user.id;
      try {
        await httpClient.delete(`/api/admin/users/${user.id}`);
        this.users = this.users.filter((item) => item.id !== user.id);
        pushToast(t("admin.delete.success"), "success");

        if (!this.users.length && this.page > 0) {
          this.fetchUsers(this.page - 1);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          pushToast(t("admin.errors.forbidden"), "error");
        } else {
          pushToast(t("admin.delete.error"), "error");
        }
      } finally {
        this.deletingId = null;
      }
    },
  },
};
</script>

<style scoped>
.admin-user-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.admin-user-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 4px;
}

.admin-user-item + .admin-user-item {
  border-top: 1px solid var(--border);
}

.admin-user-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.admin-user-item__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow-wrap: break-word;
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-user-item__badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 8px;
}

.admin-user-item__email {
  font-size: 12px;
  color: var(--text-secondary);
  overflow-wrap: break-word;
}

.admin-user-item__role {
  align-self: flex-start;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 8px;
}

.admin-user-item__role--admin {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.admin-user-item__delete {
  flex-shrink: 0;
}

.admin-user-item__delete:hover {
  color: var(--color-danger);
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.admin-pagination__btn {
  padding: 7px 14px;
  font-size: 12.5px;
}

.admin-pagination__label {
  font-size: 12.5px;
  color: var(--text-secondary);
  white-space: nowrap;
}
</style>
