export interface CreateSnippetRequest {
  title: string
  description: string
  code_content?: string
  language?: string
  is_public: boolean
  topic_id: number
}
