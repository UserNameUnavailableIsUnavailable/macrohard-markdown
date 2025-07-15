<script lang="ts">
import { defineComponent, h, Fragment } from 'vue'

export default defineComponent({
  name: 'RawHtml',
  props: {
    html: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => {
      // 1. Parse the HTML string into a temporary container
      const container = document.createElement('div')
      container.innerHTML = props.html

      // 2. Convert each child into a VNode (text or element)
      const children = Array.from(container.childNodes).map(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent
        }
        return h(
          node.tagName.toLowerCase(),
          { innerHTML: node.innerHTML },
        )
      })

      // 3. Return a Fragment of those VNodes
      return h(Fragment, null, children)
    }
  }
})
</script>
