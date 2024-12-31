import { TextArea } from '@anonworld/ui'
import { useState } from 'react'
import { useNewPost } from './context'

export function NewPostText() {
  const { text, setText } = useNewPost()
  const [height, setHeight] = useState(100)

  return (
    <TextArea
      placeholder="What's happening, anon?"
      theme="surface2"
      placeholderTextColor="$color11"
      fos="$2"
      width="100%"
      wordWrap="break-word"
      height={height}
      minHeight={100}
      value={text ?? ''}
      onChangeText={setText}
      onContentSizeChange={(e) => {
        setHeight(Math.max(100, e.nativeEvent.contentSize.height))
      }}
      autoFocus
    />
  )
}
