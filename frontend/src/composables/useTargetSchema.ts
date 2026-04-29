import { ref } from 'vue'
import * as yaml from 'js-yaml'
import type { SchemaField } from '@/types'
import { parseOpenApiToFields } from '@/utils/openApiParser'

export function useTargetSchema() {
  const fields = ref<SchemaField[]>([])
  const schemaName = ref<string>('')
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  function parseContent(content: string): void {
    const spec = yaml.load(content)
    const parsed = parseOpenApiToFields(spec)
    const s = spec as Record<string, unknown>
    schemaName.value = (s.info as Record<string, unknown>)?.title as string ?? ''
    fields.value = parsed
    error.value = null
  }

  async function loadFromFile(file: File): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const content = await file.text()
      parseContent(content)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kon bestand niet verwerken'
      fields.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadFromUrl(url: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Kon URL niet ophalen (${response.status})`)
      const content = await response.text()
      parseContent(content)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kon URL niet ophalen'
      fields.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { fields, schemaName, error, isLoading, loadFromFile, loadFromUrl }
}
