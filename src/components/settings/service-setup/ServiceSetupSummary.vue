<script setup lang="ts">
import { useSettingsMessages } from '@open-pencil/vue'

import { useServiceSetup, type ServiceSetupGroup } from '@/app/settings/service-setup/use'

import { useServiceSetupLabels } from './labels'

/** Service setup in one line per group, for the welcome: AI 1/2, Cloud storage: Local only. */
const settings = useSettingsMessages()
const { groups } = useServiceSetup()
const { groupLabels } = useServiceSetupLabels()

function summary(group: ServiceSetupGroup): string {
  if (group.id !== 'storage') return `${group.done}/${group.total}`
  return group.done === group.total
    ? settings.value.configured
    : settings.value.serviceSetupLocalOnlyShort
}
</script>

<template>
  <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1.5" data-test-id="service-setup-summary">
    <li
      v-for="group in groups"
      :key="group.id"
      class="inline-flex items-center gap-1.5"
      :data-service-group="group.id"
    >
      <icon-lucide-circle-check
        v-if="group.done === group.total"
        class="size-3.5 shrink-0 text-success"
      />
      <icon-lucide-triangle-alert
        v-else-if="group.id === 'storage'"
        class="size-3.5 shrink-0 text-warning-action"
      />
      <icon-lucide-circle-dashed v-else class="size-3.5 shrink-0 text-muted" />
      <span>{{ groupLabels[group.id] }}</span>
      <span class="text-surface">{{ summary(group) }}</span>
    </li>
  </ul>
</template>
