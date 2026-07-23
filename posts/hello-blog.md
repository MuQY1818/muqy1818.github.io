Welcome to my blog! This first post explains why I started writing, what you can expect to find here, and doubles as a live demo of everything this site can render.

<!-- How to publish a new post:
     1. Write a Markdown file in posts/, e.g. posts/my-post.md
     2. Add an entry (slug/title/date/tags/excerpt) to posts/index.json
     3. Push to GitHub. Image paths should be relative to the site root,
        e.g. static/assets/img/example.png -->

## Why a Blog?

Papers show the polished result, but most of what I learn day to day never makes it into a PDF: failed experiments, debugging stories, paper-reading notes, and small engineering tricks. A blog is the right place for those.

Writing things down also forces clarity. If I cannot explain an idea in a short post, I probably do not understand it well enough yet.

## What to Expect

- **Research notes** on Embodied AI, spatio-temporal reasoning, and VLMs
- **Paper reading summaries** with my own takeaways
- **Engineering posts** about robotics stacks, training infra, and tooling
- Occasional **meta posts** like this one

## A Taste of Code

Code blocks are syntax-highlighted and come with a copy button:

```python
import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax."""
    e = np.exp(x - x.max())
    return e / e.sum()
```

```bash
# Serving this site locally
python3 -m http.server 8000
```

Inline code like `git push origin main` works too.

## And Some Math

The scaled dot-product attention from *Attention Is All You Need*:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

Inline math such as \(d_k = 64\) and \(\sqrt{d_k} = 8\) renders inline as expected.

## Tables and Quotes

| Component        | Purpose                        |
| ---------------- | ------------------------------ |
| `posts/`         | Markdown source of every post  |
| `posts/index.json` | Manifest: slug, date, tags   |
| `blog.html`      | Post list with search + tags   |
| `post.html`      | Reader page (this page)        |

> The best way to learn is to teach — or at least to write as if someone will read it.

## Images

Figures render with rounded corners and a soft shadow:

![RoboStream framework overview](static/assets/img/Papers/RoboStream.png)

## What's Next

I will start with a reading note on recent VLM hallucination work — closely related to my **Conscious Gaze** paper — and a behind-the-scenes post on building RoboStream. Stay tuned!
