import { MDXProvider } from '@mdx-js/react'
import DocLayout from '@generates/docs/components/DocLayout.js'
import LandingLayout from '@generates/docs/components/LandingLayout.js'

const components = {
  wrapper: ({ layout, ...props }) => {
    let Wrapper = DocLayout
    if (layout === 'landing') Wrapper = LandingLayout

    return (
      <Wrapper>
        <main {...props} />
      </Wrapper>
    )
  }
}

export default function App ({ Component, pageProps }) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}
