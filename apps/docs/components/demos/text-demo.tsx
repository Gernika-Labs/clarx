import { Text } from '@clarxai/ui'
import { Preview } from '@/components/preview'

export function TextRoleDemo() {
  return (
    <Preview className="flex-col items-start gap-4">
      <Text role="heading">Heading — section title</Text>
      <Text role="body">Body — default paragraph text for reading and descriptions.</Text>
      <Text role="label">Label — uppercase field or section tag</Text>
      <Text role="caption">Caption — supporting or secondary information</Text>
      <Text role="muted">Muted — deemphasized helper text</Text>
      <Text role="code">code — monospace inline reference</Text>
    </Preview>
  )
}
